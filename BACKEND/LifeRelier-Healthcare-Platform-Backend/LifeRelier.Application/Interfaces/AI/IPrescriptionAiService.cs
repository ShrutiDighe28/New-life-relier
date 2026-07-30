using LifeRelier.Application.DTOs.AI;

namespace LifeRelier.Application.Interfaces.AI;

public interface IPrescriptionAiService
{
    Task<PrescriptionAnalyzeResponseDto> AnalyzePrescriptionAsync(PrescriptionAnalyzeRequestDto request, CancellationToken cancellationToken = default);
}
