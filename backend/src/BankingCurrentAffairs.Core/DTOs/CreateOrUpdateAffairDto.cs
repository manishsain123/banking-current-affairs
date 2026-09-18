using BankingCurrentAffairs.Core.Enums;
using System.ComponentModel.DataAnnotations;

namespace BankingCurrentAffairs.Core.DTOs;

public class CreateOrUpdateAffairDto
{
    public Guid? Id { get; set; }

    [Required]
    public DateOnly DigestDate { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    [MaxLength(300)]
    public string TitleEn { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string TitleHi { get; set; } = string.Empty;

    [Required]
    public string SummaryEn { get; set; } = string.Empty;

    [Required]
    public string SummaryHi { get; set; } = string.Empty;

    public List<string> BulletPointsEn { get; set; } = new();
    public List<string> BulletPointsHi { get; set; } = new();

    public string BankingTakeawayEn { get; set; } = string.Empty;
    public string BankingTakeawayHi { get; set; } = string.Empty;

    public string StaticGkFactEn { get; set; } = string.Empty;
    public string StaticGkFactHi { get; set; } = string.Empty;

    public ImportanceLevel Importance { get; set; } = ImportanceLevel.Standard;
    public ExamTag TargetExams { get; set; } = ExamTag.AllBanking;
    public string ExamTargetGroup { get; set; } = "CommercialBanks";

    public string Keywords { get; set; } = string.Empty;
    public string SourceUrl { get; set; } = string.Empty;
    public string SourceName { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;
    public bool IsFeatured { get; set; } = false;
}
