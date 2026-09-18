using BankingCurrentAffairs.Core.DTOs;
using BankingCurrentAffairs.Core.Entities;
using BankingCurrentAffairs.Core.Interfaces;
using BankingCurrentAffairs.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankingCurrentAffairs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly IDailyNotesJobService _jobService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<JobsController> _logger;

    public JobsController(
        IDailyNotesJobService jobService,
        ApplicationDbContext context,
        ILogger<JobsController> logger)
    {
        _jobService = jobService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Manually trigger automated daily current affairs synthesis for today or a chosen date
    /// </summary>
    [HttpPost("trigger-daily-sync")]
    [ProducesResponseType(typeof(TriggerJobResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> TriggerDailySync([FromQuery] DateOnly? date = null, CancellationToken cancellationToken = default)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        _logger.LogInformation("Admin requested manual daily notes sync for {Date}", targetDate);

        var response = await _jobService.ExecuteDailyNotesGenerationAsync(targetDate, "Admin Manual Trigger", cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Returns execution history of background automation jobs
    /// </summary>
    [HttpGet("history")]
    [ProducesResponseType(typeof(List<JobExecutionLog>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetJobHistory([FromQuery] int count = 10)
    {
        var logs = await _context.JobExecutionLogs
            .OrderByDescending(j => j.StartedAtUtc)
            .Take(Math.Min(50, Math.Max(1, count)))
            .ToListAsync();

        return Ok(logs);
    }
}
