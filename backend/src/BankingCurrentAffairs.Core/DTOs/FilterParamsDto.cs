using BankingCurrentAffairs.Core.Enums;

namespace BankingCurrentAffairs.Core.DTOs;

public class FilterParamsDto
{
    public DateOnly? Date { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public int? CategoryId { get; set; }
    public ExamTag? ExamTag { get; set; }
    public ImportanceLevel? Importance { get; set; }
    public string? SearchQuery { get; set; }
    public string? Language { get; set; } = "all"; // "en", "hi", "all"
    public string? UserId { get; set; }

    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
