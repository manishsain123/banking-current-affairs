using BankingCurrentAffairs.Core.DTOs;
using BankingCurrentAffairs.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BankingCurrentAffairs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CurrentAffairsController : ControllerBase
{
    private readonly ICurrentAffairsService _service;
    private readonly ILogger<CurrentAffairsController> _logger;

    public CurrentAffairsController(ICurrentAffairsService service, ILogger<CurrentAffairsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Gets today's latest daily digest of current affairs
    /// </summary>
    [HttpGet("today")]
    [ProducesResponseType(typeof(DailyDigestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetToday([FromQuery] string? userId = null)
    {
        var digest = await _service.GetLatestDailyDigestAsync(userId);
        if (digest == null)
        {
            return NotFound(new { message = "No daily digest has been generated yet." });
        }
        return Ok(digest);
    }

    /// <summary>
    /// Gets daily digest for a specific date (YYYY-MM-DD)
    /// </summary>
    [HttpGet("date/{date}")]
    [ProducesResponseType(typeof(DailyDigestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByDate(DateOnly date, [FromQuery] string? userId = null)
    {
        var digest = await _service.GetDailyDigestByDateAsync(date, userId);
        if (digest == null)
        {
            return NotFound(new { message = $"No notes found for date {date:yyyy-MM-dd}." });
        }
        return Ok(digest);
    }

    /// <summary>
    /// Returns available dates for calendar and date-wise archive
    /// </summary>
    [HttpGet("archive-dates")]
    [ProducesResponseType(typeof(List<DateOnly>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetArchiveDates([FromQuery] int? year = null, [FromQuery] int? month = null)
    {
        var dates = await _service.GetAvailableDigestDatesAsync(year, month);
        return Ok(dates);
    }

    /// <summary>
    /// Search and filter individual current affairs items
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(List<CurrentAffairItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] FilterParamsDto filter)
    {
        var items = await _service.SearchCurrentAffairsAsync(filter);
        return Ok(items);
    }

    /// <summary>
    /// Gets single current affair item details by GUID
    /// </summary>
    [HttpGet("items/{id:guid}")]
    [ProducesResponseType(typeof(CurrentAffairItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetItemById(Guid id, [FromQuery] string? userId = null)
    {
        var item = await _service.GetItemByIdAsync(id, userId);
        if (item == null)
        {
            return NotFound(new { message = $"Item with ID {id} not found." });
        }
        return Ok(item);
    }
}
