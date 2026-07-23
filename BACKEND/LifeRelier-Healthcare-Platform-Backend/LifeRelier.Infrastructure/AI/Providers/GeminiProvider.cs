using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using LifeRelier.Application.DTOs.AI;
using LifeRelier.Infrastructure.AI.Models;
using LifeRelier.Infrastructure.AI.Options;
using LifeRelier.Infrastructure.AI.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LifeRelier.Infrastructure.AI.Providers;

/// <summary>
/// Google Gemini API implementation of <see cref="IAIProvider"/> using the official Google AI Studio REST API.
/// </summary>
public class GeminiProvider : IAIProvider
{
    private const string DefaultFallbackModel = "gemini-1.5-flash";

    private readonly HttpClient _httpClient;
    private readonly GeminiOptions _options;
    private readonly ILogger<GeminiProvider> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
    };

    /// <summary>
    /// Initializes a new instance of the <see cref="GeminiProvider"/> class.
    /// </summary>
    /// <param name="httpClient">Injected <see cref="HttpClient"/> instance.</param>
    /// <param name="options">Injected <see cref="IOptions{GeminiOptions}"/> instance.</param>
    /// <param name="logger">Injected logger instance.</param>
    public GeminiProvider(
        HttpClient httpClient,
        IOptions<GeminiOptions> options,
        ILogger<GeminiProvider> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc/>
    public string ProviderName => "Gemini";

    /// <inheritdoc/>
    public async Task<ChatResponseDto> GenerateResponseAsync(ChatRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogError("Gemini API key is not configured in appsettings.json or environment variables.");
            return ResponseFormatter.CreateFallbackResponse(
                "AI health companion service is currently unconfigured. Please contact system administrator.",
                request.Message);
        }

        var primaryModel = NormalizeModelName(_options.Model);

        // First attempt using configured model
        var result = await ExecuteGeminiRequestAsync(primaryModel, request, cancellationToken);

        // Fallback strategy: If primary model returned 404 (Not Found / Unsupported Model), attempt fallback to standard stable model
        if (!result.IsSuccess && result.StatusCode == System.Net.HttpStatusCode.NotFound && !primaryModel.Equals(DefaultFallbackModel, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning(
                "Primary Gemini model '{PrimaryModel}' returned HTTP 404 Not Found. Retrying request with default fallback model '{FallbackModel}'.",
                primaryModel,
                DefaultFallbackModel);

            result = await ExecuteGeminiRequestAsync(DefaultFallbackModel, request, cancellationToken);
        }

        if (!result.IsSuccess)
        {
            return ResponseFormatter.CreateFallbackResponse(
                "Unable to communicate with AI health service at the moment. Please try again later.",
                request.Message);
        }

        return ResponseFormatter.FormatFromRawJson(result.RawJsonText, request.Message);
    }

    /// <summary>
    /// Executes an HTTP POST request to the Google AI Studio Gemini API.
    /// </summary>
    private async Task<(bool IsSuccess, System.Net.HttpStatusCode? StatusCode, string RawJsonText)> ExecuteGeminiRequestAsync(
        string modelName,
        ChatRequestDto request,
        CancellationToken cancellationToken)
    {
        var (requestUri, redactedUrl) = BuildRequestUrl(_options.BaseUrl, modelName, _options.ApiKey);
        var apiPayload = BuildGeminiRequestPayload(request);

        _logger.LogInformation("Initiating Gemini API call. Model: '{ModelName}', URL: '{RedactedUrl}'", modelName, redactedUrl);

        try
        {
            var jsonContent = JsonSerializer.Serialize(apiPayload, JsonOptions);
            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, requestUri)
            {
                Content = new StringContent(jsonContent, Encoding.UTF8, "application/json")
            };

            using var httpResponse = await _httpClient.SendAsync(httpRequest, cancellationToken);

            _logger.LogInformation(
                "Gemini API responded with status code {StatusCode} ({StatusCodeInt}) for model '{ModelName}'.",
                httpResponse.StatusCode,
                (int)httpResponse.StatusCode,
                modelName);

            if (!httpResponse.IsSuccessStatusCode)
            {
                var errorBody = await httpResponse.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError(
                    "Gemini API request failed! Model: '{ModelName}', Status: {StatusCode}, URL: '{RedactedUrl}', Error Body: {ErrorBody}",
                    modelName,
                    httpResponse.StatusCode,
                    redactedUrl,
                    errorBody);

                return (false, httpResponse.StatusCode, string.Empty);
            }

            var responseStream = await httpResponse.Content.ReadAsStringAsync(cancellationToken);

            if (string.IsNullOrWhiteSpace(responseStream) || !IsValidJson(responseStream))
            {
                _logger.LogError("Gemini API returned invalid or empty JSON response body for model '{ModelName}'.", modelName);
                return (false, httpResponse.StatusCode, string.Empty);
            }

            var apiResponse = JsonSerializer.Deserialize<GeminiApiResponse>(responseStream, JsonOptions);
            var rawText = ExtractResponseText(apiResponse);

            if (string.IsNullOrWhiteSpace(rawText))
            {
                _logger.LogWarning("Gemini API candidate content parts were empty for model '{ModelName}'.", modelName);
                return (false, httpResponse.StatusCode, string.Empty);
            }

            _logger.LogInformation("Successfully processed Gemini API response for model '{ModelName}'.", modelName);
            return (true, httpResponse.StatusCode, rawText);
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogWarning(ex, "Gemini API call timed out or was cancelled for model '{ModelName}'.", modelName);
            return (false, null, string.Empty);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Network HTTP error while communicating with Gemini API for model '{ModelName}'.", modelName);
            return (false, null, string.Empty);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred during Gemini API execution for model '{ModelName}'.", modelName);
            return (false, null, string.Empty);
        }
    }

    /// <summary>
    /// Robustly builds the Google Gemini REST API request URL and redacted display URL.
    /// </summary>
    private static (Uri RequestUri, string RedactedUrl) BuildRequestUrl(string? baseUrl, string model, string apiKey)
    {
        var cleanBase = (baseUrl ?? "https://generativelanguage.googleapis.com/v1beta/models/").Trim().TrimEnd('/');

        if (!cleanBase.EndsWith("models", StringComparison.OrdinalIgnoreCase))
        {
            cleanBase += "/models";
        }

        var cleanModel = NormalizeModelName(model);
        var apiKeyQueryParam = Uri.EscapeDataString(apiKey.Trim());

        var fullRequestUrl = $"{cleanBase}/{cleanModel}:generateContent?key={apiKeyQueryParam}";
        var redactedDisplayUrl = $"{cleanBase}/{cleanModel}:generateContent?key=[REDACTED]";

        return (new Uri(fullRequestUrl), redactedDisplayUrl);
    }

    /// <summary>
    /// Normalizes and cleans configured model identifiers and aliases (e.g. "models/gemini-1.5-flash", "gemini-flash-latest").
    /// </summary>
    private static string NormalizeModelName(string? model)
    {
        if (string.IsNullOrWhiteSpace(model))
        {
            return DefaultFallbackModel;
        }

        var trimmed = model.Trim();

        if (trimmed.StartsWith("models/", StringComparison.OrdinalIgnoreCase))
        {
            trimmed = trimmed["models/".Length..];
        }

        return trimmed;
    }

    /// <summary>
    /// Validates whether a given string is valid JSON format.
    /// </summary>
    private static bool IsValidJson(string input)
    {
        try
        {
            using var doc = JsonDocument.Parse(input);
            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Constructs the structured payload expected by Gemini API REST endpoint.
    /// </summary>
    private static GeminiApiRequest BuildGeminiRequestPayload(ChatRequestDto request)
    {
        var systemInstructionText = PromptBuilder.BuildSystemInstruction(request.Language);
        var userPromptText = PromptBuilder.BuildUserPrompt(request);

        return new GeminiApiRequest
        {
            SystemInstruction = new GeminiContent
            {
                Parts = [new GeminiPart { Text = systemInstructionText }]
            },
            Contents =
            [
                new GeminiContent
                {
                    Role = "user",
                    Parts = [new GeminiPart { Text = userPromptText }]
                }
            ],
            GenerationConfig = new GeminiGenerationConfig
            {
                ResponseMimeType = "application/json",
                Temperature = 0.2
            }
        };
    }

    /// <summary>
    /// Extracts raw text from candidate content parts of Gemini API response.
    /// </summary>
    private static string ExtractResponseText(GeminiApiResponse? apiResponse)
    {
        var candidate = apiResponse?.Candidates?.FirstOrDefault();
        var part = candidate?.Content?.Parts?.FirstOrDefault();

        return part?.Text ?? string.Empty;
    }
}
