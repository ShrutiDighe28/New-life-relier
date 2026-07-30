namespace LifeRelier.Application.DTOs.AI;

public class ChatRequestDto
{
    public string Message { get; set; } = string.Empty;

    public string? ConversationId { get; set; }

    public string? PatientId { get; set; }

    public string Language { get; set; } = "en";
}