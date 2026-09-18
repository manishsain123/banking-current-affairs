namespace BankingCurrentAffairs.Core.Entities;

public class Bookmark : BaseEntity
{
    public Guid ItemId { get; set; }
    public CurrentAffairItem? Item { get; set; }

    /// <summary>
    /// Student or user identifier (can be client GUID or user id)
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    public string? Note { get; set; }
}
