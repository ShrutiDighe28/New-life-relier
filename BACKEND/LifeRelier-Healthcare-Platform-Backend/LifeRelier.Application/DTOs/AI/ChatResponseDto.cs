namespace LifeRelier.Application.DTOs.AI;

public class ChatResponseDto
{
    public bool Success { get; set; }

    public string Response { get; set; } = string.Empty;

    public bool Emergency { get; set; }

    public List<string> Recommendations { get; set; } = [];

    public List<string> FollowUpQuestions { get; set; } = [];

    public string Disclaimer { get; set; } =
        "This information is for educational purposes only and does not replace professional medical advice.";
}