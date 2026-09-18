using BankingCurrentAffairs.Core.Enums;

namespace BankingCurrentAffairs.Core.DTOs;

public class DailyDigestDto
{
    public Guid Id { get; set; }
    public DateOnly DigestDate { get; set; }
    public string TitleEn { get; set; } = string.Empty;
    public string TitleHi { get; set; } = string.Empty;
    public string OverviewEn { get; set; } = string.Empty;
    public string OverviewHi { get; set; } = string.Empty;

    public List<BankingMetricDto> BankingKeyMetrics { get; set; } = new();

    public PublishStatus Status { get; set; }
    public DateTime? PublishedAtUtc { get; set; }
    public string? GeneratedBy { get; set; }

    public List<CurrentAffairItemDto> Items { get; set; } = new();

    public int TotalItemsCount => Items.Count;
}
