using LifeRelier.Application.DTOs.AI;
using LifeRelier.Application.Interfaces.AI;
using LifeRelier.Infrastructure.AI.Providers;
using Microsoft.Extensions.Logging;

namespace LifeRelier.Infrastructure.AI.Services;

/// <summary>
/// Legacy service wrapper implementing <see cref="IAIService"/>.
/// Replaces previous hardcoded rule-based response logic with dynamic LLM provider execution.
/// </summary>
public class OpenAIService : IAIService
{
    private readonly IAIProvider _aiProvider;
    private readonly ILogger<OpenAIService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="OpenAIService"/> class.
    /// </summary>
    /// <param name="aiProvider">Injected AI provider.</param>
    /// <param name="logger">Injected logger.</param>
    public OpenAIService(IAIProvider aiProvider, ILogger<OpenAIService> logger)
    {
        _aiProvider = aiProvider ?? throw new ArgumentNullException(nameof(aiProvider));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc/>
    public async Task<ChatResponseDto> ChatAsync(ChatRequestDto request)
    {
        _logger.LogInformation("OpenAIService delegating request to active AI Provider: {ProviderName}", _aiProvider.ProviderName);
        return await _aiProvider.GenerateResponseAsync(request);
    }
}