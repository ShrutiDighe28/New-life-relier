using LifeRelier.Application.DTOs.AI;
using LifeRelier.Application.Interfaces.AI;
using LifeRelier.Infrastructure.AI.Providers;
using Microsoft.Extensions.Logging;

namespace LifeRelier.Infrastructure.AI.Services;

/// <summary>
/// Gemini-powered AI Service implementing <see cref="IAIService"/>.
/// Delegates generation to an injected <see cref="IAIProvider"/> to enable seamless provider swappability.
/// </summary>
public class GeminiService : IAIService
{
    private readonly IAIProvider _aiProvider;
    private readonly ILogger<GeminiService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="GeminiService"/> class.
    /// </summary>
    /// <param name="aiProvider">The active AI LLM provider implementation.</param>
    /// <param name="logger">The logger instance.</param>
    public GeminiService(IAIProvider aiProvider, ILogger<GeminiService> logger)
    {
        _aiProvider = aiProvider ?? throw new ArgumentNullException(nameof(aiProvider));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc/>
    public async Task<ChatResponseDto> ChatAsync(ChatRequestDto request)
    {
        ArgumentNullException.ThrowIfNull(request);

        _logger.LogInformation("Processing chat request with AI Provider: {ProviderName}", _aiProvider.ProviderName);

        try
        {
            return await _aiProvider.GenerateResponseAsync(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error in GeminiService.ChatAsync.");
            return ResponseFormatter.CreateFallbackResponse(
                "An unexpected error occurred. Please try again later.",
                request.Message);
        }
    }
}
