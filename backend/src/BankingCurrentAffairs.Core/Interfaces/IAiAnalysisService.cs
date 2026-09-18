using BankingCurrentAffairs.Core.DTOs;

namespace BankingCurrentAffairs.Core.Interfaces;

public class GeneratedQuestionResult
{
    public string QuestionType { get; set; } = "StandardMCQ";
    public string DifficultyLevel { get; set; } = "ExamLevel";
    public string TargetExam { get; set; } = "SBI PO / RBI Grade B";
    public string ExamTargetGroup { get; set; } = "CommercialBanks";
    public string CategorySlug { get; set; } = "banking-finance";

    public string QuestionEn { get; set; } = string.Empty;
    public string QuestionHi { get; set; } = string.Empty;

    public List<string> OptionsEn { get; set; } = new();
    public List<string> OptionsHi { get; set; } = new();

    public string CorrectAnswer { get; set; } = "A";

    public string ExplanationEn { get; set; } = string.Empty;
    public string ExplanationHi { get; set; } = string.Empty;

    public string DeepAnalysisEn { get; set; } = string.Empty;
    public string DeepAnalysisHi { get; set; } = string.Empty;

    public string StaticConceptLinkEn { get; set; } = string.Empty;
    public string StaticConceptLinkHi { get; set; } = string.Empty;

    public string ExaminerTrapWarningEn { get; set; } = string.Empty;
    public string ExaminerTrapWarningHi { get; set; } = string.Empty;

    public Guid? RelatedAffairItemId { get; set; }
}

public interface IAiAnalysisService
{
    Task<List<GeneratedQuestionResult>> AnalyzeAndGenerateForMonthAsync(string monthYear, CancellationToken cancellationToken = default);
}
