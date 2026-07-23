using System.Text;
using LifeRelier.Application.DTOs.AI;
using LifeRelier.Infrastructure.AI.Prompts;

namespace LifeRelier.Infrastructure.AI.Services;

/// <summary>
/// Helper service for constructing formatted prompts for LLM requests.
/// </summary>
public static class PromptBuilder
{
    /// <summary>
    /// Builds system instructions customized with language requirements.
    /// </summary>
    /// <param name="language">Preferred response language (e.g., "en", "es").</param>
    /// <returns>Formatted system instruction string.</returns>
    public static string BuildSystemInstruction(string language = "en")
    {
        var builder = new StringBuilder(SystemPrompt.HealthCompanionInstruction);

        if (!string.IsNullOrWhiteSpace(language) && !language.Equals("en", StringComparison.OrdinalIgnoreCase))
        {
            builder.AppendLine();
            builder.AppendLine($"PREFERRED LANGUAGE RULE: Please respond in the user's requested language ({language}) while maintaining the exact JSON schema structure.");
        }

        return builder.ToString();
    }

    /// <summary>
    /// Formats incoming <see cref="ChatRequestDto"/> into prompt content.
    /// </summary>
    /// <param name="request">User chat request object.</param>
    /// <returns>Clean user prompt string.</returns>
    public static string BuildUserPrompt(ChatRequestDto request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return "Hello";
        }

        return request.Message.Trim();
    }
}
