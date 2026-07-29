using System.Text.Json;
using Google.GenAI;
using LifeRelier.Application.DTOs.AI;
using LifeRelier.Application.Interfaces.AI;
using LifeRelier.Infrastructure.AI.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LifeRelier.Infrastructure.AI.Services;

public class PrescriptionAiService : IPrescriptionAiService
{
    private readonly GeminiOptions _options;
    private readonly ILogger<PrescriptionAiService> _logger;

    public PrescriptionAiService(IOptions<GeminiOptions> options, ILogger<PrescriptionAiService> logger)
    {
        _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<PrescriptionAnalyzeResponseDto> AnalyzePrescriptionAsync(
        PrescriptionAnalyzeRequestDto request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogError("Gemini API key is not configured in the backend settings.");
            throw new InvalidOperationException("AI service is currently unconfigured. API Key is missing.");
        }

        _logger.LogInformation("Analyzing prescription text with official Google GenAI SDK using model {Model}", _options.Model);

        try
        {
            // Initialize the official Google GenAI Client
            var client = new Client(apiKey: _options.ApiKey);

            var systemInstruction = "You are an expert healthcare AI assistant. Analyze the prescription text and return ONLY a valid JSON object matching the requested schema. Do not include markdown formatting code blocks like ```json.";

            var prompt = $@"Analyze the following prescription text extracted via OCR and compile structured details:
Prescription OCR Text:
""""""
{request.OcrText}
""""""

Return ONLY a JSON object matching this schema:
{{
  ""doctorName"": ""String"",
  ""hospitalName"": ""String"",
  ""patientName"": ""String"",
  ""date"": ""String (YYYY-MM-DD)"",
  ""diagnosis"": ""String"",
  ""medicines"": [
    {{
      ""name"": ""String"",
      ""strength"": ""String"",
      ""dosage"": ""String"",
      ""frequency"": ""String"",
      ""duration"": ""String"",
      ""instructions"": ""String""
    }}
  ],
  ""warnings"": [""String""],
  ""followUp"": ""String"",
  ""confidence"": 95
}}";

            // Generate content using the official client
            var response = await client.Models.GenerateContentAsync(
                model: _options.Model,
                contents: $"{systemInstruction}\n\n{prompt}"
            );

            var textResult = response.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

            if (string.IsNullOrWhiteSpace(textResult))
            {
                _logger.LogError("Gemini API returned an empty response payload.");
                throw new Exception("Received empty response from the AI model.");
            }

            // Clean markdown blocks if returned
            var cleanedText = textResult.Trim();
            if (cleanedText.StartsWith("```json"))
            {
                cleanedText = cleanedText.Substring(7);
            }
            else if (cleanedText.StartsWith("```"))
            {
                cleanedText = cleanedText.Substring(3);
            }
            if (cleanedText.EndsWith("```"))
            {
                cleanedText = cleanedText.Substring(0, cleanedText.Length - 3);
            }
            cleanedText = cleanedText.Trim();

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var result = JsonSerializer.Deserialize<PrescriptionAnalyzeResponseDto>(cleanedText, jsonOptions);
            if (result == null)
            {
                throw new Exception("Failed to deserialize structured AI response.");
            }

            _logger.LogInformation("Prescription analysis successfully processed via Google GenAI SDK.");
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze prescription using Google GenAI SDK.");
            throw;
        }
    }
}
