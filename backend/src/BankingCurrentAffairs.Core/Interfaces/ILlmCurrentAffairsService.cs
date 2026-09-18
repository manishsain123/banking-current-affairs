using BankingCurrentAffairs.Core.DTOs;

namespace BankingCurrentAffairs.Core.Interfaces;

public class GeneratedDailyDigestResult
{
    public string TitleEn { get; set; } = string.Empty;
    public string TitleHi { get; set; } = string.Empty;
    public string OverviewEn { get; set; } = string.Empty;
    public string OverviewHi { get; set; } = string.Empty;
    public List<BankingMetricDto> BankingKeyMetrics { get; set; } = new();
    public List<GeneratedAffairItemResult> Items { get; set; } = new();
}

public class GeneratedAffairItemResult
{
    public string CategorySlug { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string TitleHi { get; set; } = string.Empty;
    public string SummaryEn { get; set; } = string.Empty;
    public string SummaryHi { get; set; } = string.Empty;
    public List<string> BulletPointsEn { get; set; } = new();
    public List<string> BulletPointsHi { get; set; } = new();
    public string BankingTakeawayEn { get; set; } = string.Empty;
    public string BankingTakeawayHi { get; set; } = string.Empty;
    public string StaticGkFactEn { get; set; } = string.Empty;
    public string StaticGkFactHi { get; set; } = string.Empty;
    public string Importance { get; set; } = "High";
    public string TargetExams { get; set; } = "AllBanking";
    public string ExamTargetGroup { get; set; } = "CommercialBanks";
    public string Keywords { get; set; } = string.Empty;
    public string SourceName { get; set; } = string.Empty;
    public string SourceUrl { get; set; } = string.Empty;
}

public interface ILlmCurrentAffairsService
{
    Task<GeneratedDailyDigestResult> GenerateDigestForDateAsync(DateOnly date, CancellationToken cancellationToken = default);
}
