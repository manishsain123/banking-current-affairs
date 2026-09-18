using BankingCurrentAffairs.Core.DTOs;

namespace BankingCurrentAffairs.Core.Interfaces;

public interface IBookmarkService
{
    Task<List<BookmarkResponseDto>> GetUserBookmarksAsync(string userId);
    Task<bool> ToggleBookmarkAsync(Guid itemId, string userId, string? note = null);
    Task<bool> IsBookmarkedAsync(Guid itemId, string userId);
    Task<bool> DeleteBookmarkAsync(Guid itemId, string userId);
}
