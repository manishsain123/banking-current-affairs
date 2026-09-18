using BankingCurrentAffairs.Core.Enums;

namespace BankingCurrentAffairs.Core.DTOs;

public class CurrentAffairItemDto
{
    public Guid Id { get; set; }
    public Guid DigestId { get; set; }
    public DateOnly DigestDate { get; set; }

    public int CategoryId { get; set; }
    public string CategoryNameEn { get; set; } = string.Empty;
    public string CategoryNameHi { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;

    // Bilingual Headline & Overview
    public string TitleEn { get; set; } = string.Empty;
    public string TitleHi { get; set; } = string.Empty;

    public string SummaryEn { get; set; } = string.Empty;
    public string SummaryHi { get; set; } = string.Empty;

    // Deserialized Bullet Points
    public List<string> BulletPointsEn { get; set; } = new();
    public List<string> BulletPointsHi { get; set; } = new();

    // Banking & Financial Highlights
    public string BankingTakeawayEn { get; set; } = string.Empty;
    public string BankingTakeawayHi { get; set; } = string.Empty;

    // Static GK & Exam Relevance
    public string StaticGkFactEn { get; set; } = string.Empty;
    public string StaticGkFactHi { get; set; } = string.Empty;

    public ImportanceLevel Importance { get; set; }
    public string ImportanceText => Importance.ToString();

    public ExamTag TargetExams { get; set; }
    public string TargetExamsText => TargetExams.ToString();

    public List<string> KeywordsList { get; set; } = new();

    public string SourceUrl { get; set; } = string.Empty;
    public string SourceName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsBookmarked { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
