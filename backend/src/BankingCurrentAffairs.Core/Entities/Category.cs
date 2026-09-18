namespace BankingCurrentAffairs.Core.Entities;

public class Category
{
    public int Id { get; set; }
    public string NameEn { get; set; } = string.Empty;
    public string NameHi { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionHi { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<CurrentAffairItem> Items { get; set; } = new List<CurrentAffairItem>();
}
