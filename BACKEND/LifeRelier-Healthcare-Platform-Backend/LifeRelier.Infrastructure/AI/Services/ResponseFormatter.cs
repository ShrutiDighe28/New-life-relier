using System.Text.Json;
using LifeRelier.Application.DTOs.AI;
using LifeRelier.Infrastructure.AI.Models;

namespace LifeRelier.Infrastructure.AI.Services;

/// <summary>
/// Formatter service to transform raw Gemini API output and fallback states into standard <see cref="ChatResponseDto"/>.
/// Detects valid JSON payload strings and deserializes them into structured response DTOs.
/// </summary>
public static class ResponseFormatter
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        AllowTrailingCommas = true
    };

    /// <summary>
    /// Deserializes a JSON text payload or plain text response into a <see cref="ChatResponseDto"/>.
    /// Automatically unwraps nested JSON strings if present.
    /// </summary>
    /// <param name="jsonText">Raw text string received from Gemini API.</param>
    /// <param name="userMessage">Original user input message for safety validation.</param>
    /// <returns>Formatted <see cref="ChatResponseDto"/>.</returns>
    public static ChatResponseDto FormatFromRawJson(string jsonText, string? userMessage)
    {
        if (string.IsNullOrWhiteSpace(jsonText))
        {
            return CreateFallbackResponse("I'm sorry, I couldn't generate a response at this time. Please try again.", userMessage);
        }

        var cleanedText = CleanJsonText(jsonText);

        try
        {
            // Attempt deserializing raw text as structured JSON response
            var structured = JsonSerializer.Deserialize<GeminiStructuredResponse>(cleanedText, JsonOptions);

            if (structured != null)
            {
                // Unwrap nested JSON string if Gemini returned JSON inside the "response" property
                structured = UnwrapNestedJsonIfNeeded(structured);

                var responseDto = new ChatResponseDto
                {
                    Success = true,
                    Response = structured.Response,
                    Emergency = structured.Emergency,
                    Recommendations = structured.Recommendations ?? [],
                    FollowUpQuestions = structured.FollowUpQuestions ?? []
                };

                SafetyValidator.ValidateAndApplyEmergencyOverride(responseDto, userMessage);

                return responseDto;
            }
        }
        catch (JsonException)
        {
            // If raw text is plain text instead of JSON, fall back to fallback formatting
        }

        return CreateFallbackResponse(cleanedText, userMessage);
    }

    /// <summary>
    /// Creates a fallback response object when AI provider calls return plain text or encounter formatting errors.
    /// </summary>
    /// <param name="fallbackMessage">User-friendly fallback message or plain text response.</param>
    /// <param name="userMessage">Original user message for emergency symptom check.</param>
    /// <returns>Fallback <see cref="ChatResponseDto"/>.</returns>
    public static ChatResponseDto CreateFallbackResponse(string fallbackMessage, string? userMessage)
    {
        var isEmergency = SafetyValidator.IsEmergencySymptom(userMessage);

        var response = new ChatResponseDto
        {
            Success = !string.IsNullOrWhiteSpace(fallbackMessage),
            Response = isEmergency
                ? "WARNING: Emergency symptoms detected. If you are experiencing chest pain, difficulty breathing, or severe sudden symptoms, seek emergency medical care immediately."
                : fallbackMessage,
            Emergency = isEmergency,
            Recommendations = isEmergency
                ? ["Seek immediate emergency medical care", "Call emergency services or go to the nearest hospital"]
                : ["Consult a qualified healthcare professional for personalized medical advice"],
            FollowUpQuestions = isEmergency
                ? ["Are you currently in a safe location to contact emergency services?"]
                : ["Would you like general health advice on another topic?"]
        };

        return response;
    }

    /// <summary>
    /// Recursively unwraps inner JSON string inside <see cref="GeminiStructuredResponse.Response"/> if Gemini nested a JSON object.
    /// </summary>
    private static GeminiStructuredResponse UnwrapNestedJsonIfNeeded(GeminiStructuredResponse structured)
    {
        var current = structured;
        var maxUnwrapDepth = 3;

        while (maxUnwrapDepth > 0 && !string.IsNullOrWhiteSpace(current.Response))
        {
            var trimmedResponse = CleanJsonText(current.Response);

            if (trimmedResponse.StartsWith('{') && trimmedResponse.EndsWith('}'))
            {
                try
                {
                    var inner = JsonSerializer.Deserialize<GeminiStructuredResponse>(trimmedResponse, JsonOptions);

                    if (inner != null && !string.IsNullOrWhiteSpace(inner.Response))
                    {
                        // Preserve non-empty recommendations and follow-up questions from outer structure if inner is empty
                        if ((inner.Recommendations == null || inner.Recommendations.Count == 0) && (current.Recommendations?.Count > 0))
                        {
                            inner.Recommendations = current.Recommendations;
                        }

                        if ((inner.FollowUpQuestions == null || inner.FollowUpQuestions.Count == 0) && (current.FollowUpQuestions?.Count > 0))
                        {
                            inner.FollowUpQuestions = current.FollowUpQuestions;
                        }

                        if (current.Emergency)
                        {
                            inner.Emergency = true;
                        }

                        var wasNestedJson = inner.Response.TrimStart().StartsWith('{');
                        current = inner;

                        if (!wasNestedJson)
                        {
                            break;
                        }
                    }
                    else
                    {
                        break;
                    }
                }
                catch
                {
                    break;
                }
            }
            else
            {
                break;
            }

            maxUnwrapDepth--;
        }

        return current;
    }

    /// <summary>
    /// Cleans raw text string from Gemini by stripping markdown code fences if present.
    /// </summary>
    /// <param name="jsonText">Raw text string.</param>
    /// <returns>Cleaned text string.</returns>
    private static string CleanJsonText(string jsonText)
    {
        var trimmed = jsonText.Trim();

        if (trimmed.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
        {
            trimmed = trimmed[7..];
        }
        else if (trimmed.StartsWith("```", StringComparison.OrdinalIgnoreCase))
        {
            trimmed = trimmed[3..];
        }

        if (trimmed.EndsWith("```", StringComparison.OrdinalIgnoreCase))
        {
            trimmed = trimmed[..^3];
        }

        return trimmed.Trim();
    }
}
