using BankingCurrentAffairs.Core.DTOs;
using BankingCurrentAffairs.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BankingCurrentAffairs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamQuestionsController : ControllerBase
{
    private readonly IExamQuestionService _examQuestionService;
    private readonly ILogger<ExamQuestionsController> _logger;

    public ExamQuestionsController(IExamQuestionService examQuestionService, ILogger<ExamQuestionsController> logger)
    {
        _examQuestionService = examQuestionService;
        _logger = logger;
    }

    /// <summary>
    /// Gets list of all available months with question and current affairs counts
    /// </summary>
    [HttpGet("months")]
    [ProducesResponseType(typeof(List<MonthArchiveSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableMonths()
    {
        var months = await _examQuestionService.GetAvailableMonthsAsync();
        return Ok(months);
    }

    /// <summary>
    /// Gets exam-grade expected questions for a specific month (e.g. "2026-09") with optional filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ExpectedQuestionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetQuestions(
        [FromQuery] string? monthYear = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] string? difficulty = null,
        [FromQuery] string? questionType = null,
        [FromQuery] string? targetGroup = null)
    {
        var targetMonth = string.IsNullOrWhiteSpace(monthYear)
            ? $"{DateTime.UtcNow.Year:D4}-{DateTime.UtcNow.Month:D2}"
            : monthYear;

        var questions = await _examQuestionService.GetQuestionsByMonthAsync(targetMonth, categoryId, difficulty, questionType, targetGroup);
        return Ok(questions);
    }

    /// <summary>
    /// Gets details of a single expected question by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ExpectedQuestionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await _examQuestionService.GetQuestionByIdAsync(id);
        if (item == null)
        {
            return NotFound(new { message = $"Question {id} not found." });
        }
        return Ok(item);
    }

    /// <summary>
    /// Triggers AI-driven deep analysis and question generation for the requested month
    /// </summary>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(GenerateQuestionsResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GenerateForMonth([FromBody] GenerateQuestionsRequestDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.MonthYear))
        {
            dto.MonthYear = $"{DateTime.UtcNow.Year:D4}-{DateTime.UtcNow.Month:D2}";
        }

        _logger.LogInformation("Generating expected questions for {MonthYear}", dto.MonthYear);
        var response = await _examQuestionService.GenerateAndSaveMonthQuestionsAsync(dto.MonthYear, cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Deletes a specific question by ID (Admin)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _examQuestionService.DeleteQuestionAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = $"Question {id} not found." });
        }
        return NoContent();
    }
}
