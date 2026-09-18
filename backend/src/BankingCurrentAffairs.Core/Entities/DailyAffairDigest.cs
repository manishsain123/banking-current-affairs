using BankingCurrentAffairs.Core.Enums;

namespace BankingCurrentAffairs.Core.Entities;

public class DailyAffairDigest : BaseEntity
{
    public DateOnly DigestDate { get; set; }
    public string TitleEn { get; set; } = string.Empty;
    public string TitleHi { get; set; } = string.Empty;
    public string OverviewEn { get; set; } = string.Empty;
    public string OverviewHi { get; set; } = string.Empty;

    /// <summary>
    /// JSON array or structured string of key banking metrics (e.g. Repo Rate, Reverse Repo, SDF, MSF, Bank Rate, CRR, SLR)
    /// </summary>
    public string BankingKeyMetricsJson { get; set; } = "[]";

    public PublishStatus Status { get; set; } = PublishStatus.Published;
    public DateTime? PublishedAtUtc { get; set; }
    public string? GeneratedBy { get; set; } = "Automated AI Pipeline";

    // Navigation
    public ICollection<CurrentAffairItem> Items { get; set; } = new List<CurrentAffairItem>();
}
