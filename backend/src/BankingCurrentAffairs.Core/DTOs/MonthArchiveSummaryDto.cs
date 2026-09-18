namespace BankingCurrentAffairs.Core.DTOs;

public class MonthArchiveSummaryDto
{
    public string MonthYear { get; set; } = string.Empty; // "2026-09"
    public string MonthYearDisplay { get; set; } = string.Empty; // "September 2026"
    public int QuestionCount { get; set; }
    public int CurrentAffairsCount { get; set; }
    public bool IsAnalyzed { get; set; }
}

public class GenerateQuestionsRequestDto
{
    public string MonthYear { get; set; } = string.Empty; // "YYYY-MM"
    public int? TargetQuestionCount { get; set; } = 5;
    public string? TargetExam { get; set; } = "SBI PO / RBI Grade B";
}

public class GenerateQuestionsResponseDto
{
    public string MonthYear { get; set; } = string.Empty;
    public int QuestionsGenerated { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<ExpectedQuestionDto> Questions { get; set; } = new();
}
