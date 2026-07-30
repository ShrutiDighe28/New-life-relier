using LifeRelier.Application.DTOs.AI;

namespace LifeRelier.Infrastructure.AI.Services;

/// <summary>
/// Safety validator for identifying red-flag emergency symptoms in patient messages
/// and applying guardrails to AI responses.
/// </summary>
public static class SafetyValidator
{
    private static readonly string[] EmergencyKeywords =
    [
        "chest pain",
        "chest pressure",
        "chest tightness",
        "heart attack",
        "stroke",
        "slurred speech",
        "facial droop",
        "face drooping",
        "shortness of breath",
        "difficulty breathing",
        "trouble breathing",
        "can't breathe",
        "cannot breathe",
        "loss of consciousness",
        "passed out",
        "pass out",
        "unconscious",
        "fainted",
        "fainting",
        "severe bleeding",
        "coughing blood",
        "head injury",
        "anaphylaxis",
        "seizure"
    ];

    /// <summary>
    /// Checks if a given message contains red-flag emergency medical symptoms.
    /// </summary>
    /// <param name="userMessage">User input message string.</param>
    /// <returns><c>true</c> if emergency symptoms are detected; otherwise, <c>false</c>.</returns>
    public static bool IsEmergencySymptom(string? userMessage)
    {
        if (string.IsNullOrWhiteSpace(userMessage))
        {
            return false;
        }

        return EmergencyKeywords.Any(keyword => userMessage.Contains(keyword, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Ensures safety rules and emergency overrides are enforced on the final chat response.
    /// </summary>
    /// <param name="response">The generated <see cref="ChatResponseDto"/>.</param>
    /// <param name="userMessage">The raw user prompt.</param>
    public static void ValidateAndApplyEmergencyOverride(ChatResponseDto response, string? userMessage)
    {
        ArgumentNullException.ThrowIfNull(response);

        if (IsEmergencySymptom(userMessage))
        {
            response.Emergency = true;

            if (!response.Recommendations.Any(r => r.Contains("emergency", StringComparison.OrdinalIgnoreCase)))
            {
                response.Recommendations.Insert(0, "Seek immediate emergency medical attention (call 911 or visit the nearest emergency room).");
            }
        }
    }
}
