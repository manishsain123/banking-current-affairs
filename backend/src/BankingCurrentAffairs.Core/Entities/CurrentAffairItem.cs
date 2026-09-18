using BankingCurrentAffairs.Core.Enums;

namespace BankingCurrentAffairs.Core.Entities;

public class CurrentAffairItem : BaseEntity
{
    public Guid DigestId { get; set; }
    public DailyAffairDigest? Digest { get; set; }

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    // Bilingual Headline & Overview
    public string TitleEn { get; set; } = string.Empty;
    public string TitleHi { get; set; } = string.Empty;

    public string SummaryEn { get; set; } = string.Empty;
    public string SummaryHi { get; set; } = string.Empty;

    /// <summary>
    /// Stored as JSON array string: ["Point 1", "Point 2", ...]
    /// </summary>
    public string BulletPointsEnJson { get; set; } = "[]";

    /// <summary>
    /// Stored as JSON array string: ["बिंदु 1", "बिंदु 2", ...]
    /// </summary>
    public string BulletPointsHiJson { get; set; } = "[]";

    // Dedicated Banking & Financial Highlight section
    public string BankingTakeawayEn { get; set; } = string.Empty;
    public string BankingTakeawayHi { get; set; } = string.Empty;

    // Static GK / Banking Awareness associated concept (e.g., Headquarters, Founded year, Tagline, Section of Act)
    public string StaticGkFactEn { get; set; } = string.Empty;
    public string StaticGkFactHi { get; set; } = string.Empty;

    // Exam Relevance
    public ImportanceLevel Importance { get; set; } = ImportanceLevel.Standard;
    public ExamTag TargetExams { get; set; } = ExamTag.AllBanking;

    // Keywords (comma-separated or JSON) for quick search
    public string Keywords { get; set; } = string.Empty;

    // Metadata & Sourcing
    public string SourceUrl { get; set; } = string.Empty;
    public string SourceName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;
    public bool IsFeatured { get; set; } = false;

    // Navigation
    public ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
}
