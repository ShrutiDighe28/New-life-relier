using LifeRelier.Application.DTOs.AI;

namespace LifeRelier.Infrastructure.AI.Providers;

/// <summary>
/// Abstraction interface for LLM AI providers (e.g., Gemini, OpenAI, Claude, DeepSeek, Ollama).
/// Enables seamless provider switching without changing core application business logic.
/// </summary>
public interface IAIProvider
{
    /// <summary>
    /// Gets the unique identifier name of the AI provider.
    /// </summary>
    string ProviderName { get; }

    /// <summary>
    /// Generates a structured health assistant response from the underlying LLM provider.
    /// </summary>
    /// <param name="request">The chat request containing user prompt and contextual metadata.</param>
    /// <param name="cancellationToken">A token to cancel the asynchronous operation.</param>
    /// <returns>A <see cref="ChatResponseDto"/> containing AI response, emergency flag, recommendations, and follow-up questions.</returns>
    Task<ChatResponseDto> GenerateResponseAsync(ChatRequestDto request, CancellationToken cancellationToken = default);
}
