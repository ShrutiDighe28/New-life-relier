using LifeRelier.Application.DTOs.AI;
using LifeRelier.Application.DTOs.Prescription;
using LifeRelier.Application.Interfaces;
using LifeRelier.Application.Interfaces.AI;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace LifeRelier.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PrescriptionController : ControllerBase
{
    private readonly IPrescriptionAiService _prescriptionAiService;
    private readonly IPrescriptionService _prescriptionService;

    public PrescriptionController(
        IPrescriptionAiService prescriptionAiService,
        IPrescriptionService prescriptionService)
    {
        _prescriptionAiService = prescriptionAiService ?? throw new ArgumentNullException(nameof(prescriptionAiService));
        _prescriptionService = prescriptionService ?? throw new ArgumentNullException(nameof(prescriptionService));
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> Analyze(PrescriptionAnalyzeRequestDto request)
    {
        try
        {
            var response = await _prescriptionAiService.AnalyzePrescriptionAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save(PrescriptionSaveDto request)
    {
        try
        {
            var result = await _prescriptionService.SavePrescriptionAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("history/{patientId}")]
    public async Task<IActionResult> GetHistory(string patientId)
    {
        try
        {
            var result = await _prescriptionService.GetPrescriptionHistoryAsync(patientId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _prescriptionService.GetPrescriptionByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = "Prescription not found." });
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, PrescriptionSaveDto request)
    {
        try
        {
            var result = await _prescriptionService.UpdatePrescriptionAsync(id, request);
            if (result == null)
            {
                return NotFound(new { message = "Prescription not found." });
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var success = await _prescriptionService.DeletePrescriptionAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Prescription not found." });
            }
            return Ok(new { success = true, message = "Prescription deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
