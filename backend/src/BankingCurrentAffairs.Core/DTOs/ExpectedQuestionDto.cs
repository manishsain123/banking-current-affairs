namespace BankingCurrentAffairs.Core.DTOs;

public class ExpectedQuestionDto
{
    public Guid Id { get; set; }
    public string MonthYear { get; set; } = string.Empty;
    public string MonthYearDisplay { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public string CategoryNameEn { get; set; } = string.Empty;
    public string CategoryNameHi { get; set; } = string.Empty;

    public string QuestionType { get; set; } = string.Empty;
    public string DifficultyLevel { get; set; } = string.Empty;
    public string TargetExam { get; set; } = string.Empty;
    public string ExamTargetGroup { get; set; } = "CommercialBanks";

    // Bilingual Questions
    public string QuestionEn { get; set; } = string.Empty;
    public string QuestionHi { get; set; } = string.Empty;

    // Deserialized Options
    public List<string> OptionsEn { get; set; } = new();
    public List<string> OptionsHi { get; set; } = new();

    public string CorrectAnswer { get; set; } = string.Empty;

    // Bilingual Explanations
    public string ExplanationEn { get; set; } = string.Empty;
    public string ExplanationHi { get; set; } = string.Empty;

    // Deep Analysis & Static GK links
    public string DeepAnalysisEn { get; set; } = string.Empty;
    public string DeepAnalysisHi { get; set; } = string.Empty;
    public string StaticConceptLinkEn { get; set; } = string.Empty;
    public string StaticConceptLinkHi { get; set; } = string.Empty;
    public string ExaminerTrapWarningEn { get; set; } = string.Empty;
    public string ExaminerTrapWarningHi { get; set; } = string.Empty;

    public Guid? RelatedAffairItemId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
