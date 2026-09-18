namespace BankingCurrentAffairs.Core.DTOs;

public class BookmarkDto
{
    public Guid ItemId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? Note { get; set; }
}

public class BookmarkResponseDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public CurrentAffairItemDto? Item { get; set; }
}
