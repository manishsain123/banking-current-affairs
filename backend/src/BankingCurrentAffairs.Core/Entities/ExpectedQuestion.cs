namespace BankingCurrentAffairs.Core.Entities;

public class ExpectedQuestion : BaseEntity
{
    /// <summary>
    /// Format: "YYYY-MM" (e.g. "2026-09")
    /// </summary>
    public string MonthYear { get; set; } = string.Empty;

    /// <summary>
    /// e.g. "September 2026"
    /// </summary>
    public string MonthYearDisplay { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    /// <summary>
    /// "StandardMCQ", "StatementBased", "MatchTheColumn"
    /// </summary>
    public string QuestionType { get; set; } = "StandardMCQ";

    /// <summary>
    /// "Moderate", "ExamLevel", "HardPhase2"
    /// </summary>
    public string DifficultyLevel { get; set; } = "ExamLevel";

    /// <summary>
    /// Target exams: e.g. "SBI PO / RBI Grade B", "IBPS PO / Clerk"
    /// </summary>
    public string TargetExam { get; set; } = "All Banking & Insurance";

    // Bilingual Questions
    public string QuestionEn { get; set; } = string.Empty;
    public string QuestionHi { get; set; } = string.Empty;

    /// <summary>
    /// JSON array of 5 options: ["A) Option 1", "B) Option 2", ...]
    /// </summary>
    public string OptionsEnJson { get; set; } = "[]";

    /// <summary>
    /// JSON array of 5 options in Hindi: ["A) विकल्प 1", "B) विकल्प 2", ...]
    /// </summary>
    public string OptionsHiJson { get; set; } = "[]";

    /// <summary>
    /// "A", "B", "C", "D", or "E"
    /// </summary>
    public string CorrectAnswer { get; set; } = string.Empty;

    // Bilingual Detailed Explanations
    public string ExplanationEn { get; set; } = string.Empty;
    public string ExplanationHi { get; set; } = string.Empty;

    // Deep Analysis & Static Banking Context
    public string DeepAnalysisEn { get; set; } = string.Empty;
    public string DeepAnalysisHi { get; set; } = string.Empty;

    /// <summary>
    /// Associated static banking concepts (e.g. "RBI Act 1934 Section 42(1), Monetary Policy Transmission")
    /// </summary>
    public string StaticConceptLinkEn { get; set; } = string.Empty;
    public string StaticConceptLinkHi { get; set; } = string.Empty;

    /// <summary>
    /// Specific trick or common mistake examiners exploit in banking exams
    /// </summary>
    public string ExaminerTrapWarningEn { get; set; } = string.Empty;
    public string ExaminerTrapWarningHi { get; set; } = string.Empty;

    public Guid? RelatedAffairItemId { get; set; }
    public CurrentAffairItem? RelatedAffairItem { get; set; }
}
