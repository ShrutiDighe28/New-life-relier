namespace LifeRelier.Infrastructure.AI.Options;

/// <summary>
/// Configuration options for connecting to the Google Gemini AI API.
/// </summary>
public class GeminiOptions
{
    /// <summary>
    /// Configuration section name in appsettings.json.
    /// </summary>
    public const string SectionName = "AiSettings:Gemini";

    /// <summary>
    /// Gets or sets the API Key used to authenticate with Google Gemini API.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Gemini model identifier (e.g., "gemini-2.5-flash", "gemini-1.5-flash").
    /// </summary>
    public string Model { get; set; } = "gemini-2.5-flash";

    /// <summary>
    /// Gets or sets the base endpoint URL for Google Gemini REST API.
    /// </summary>
    public string BaseUrl { get; set; } = "https://generativelanguage.googleapis.com/v1beta/models/";

    /// <summary>
    /// Gets or sets HTTP request timeout in seconds.
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;
}
