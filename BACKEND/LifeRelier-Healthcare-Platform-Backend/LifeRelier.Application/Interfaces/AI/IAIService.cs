using LifeRelier.Application.DTOs.AI;

namespace LifeRelier.Application.Interfaces.AI;

public interface IAIService
{
    Task<ChatResponseDto> ChatAsync(ChatRequestDto request);
}