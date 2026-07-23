using LifeRelier.Application.DTOs.AI;
using LifeRelier.Application.Interfaces.AI;
using Microsoft.AspNetCore.Mvc;

namespace LifeRelier.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;

    public AIController(IAIService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat(ChatRequestDto request)
    {
        var response = await _aiService.ChatAsync(request);

        return Ok(response);
    }
}