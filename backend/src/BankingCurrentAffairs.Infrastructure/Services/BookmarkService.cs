using BankingCurrentAffairs.Core.DTOs;
using BankingCurrentAffairs.Core.Entities;
using BankingCurrentAffairs.Core.Interfaces;
using BankingCurrentAffairs.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BankingCurrentAffairs.Infrastructure.Services;

public class BookmarkService : IBookmarkService
{
    private readonly ApplicationDbContext _context;

    public BookmarkService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BookmarkResponseDto>> GetUserBookmarksAsync(string userId)
    {
        var bookmarks = await _context.Bookmarks
            .Where(b => b.UserId == userId)
            .Include(b => b.Item)
                .ThenInclude(i => i!.Category)
            .Include(b => b.Item)
                .ThenInclude(i => i!.Digest)
            .OrderByDescending(b => b.CreatedAtUtc)
            .ToListAsync();

        return bookmarks.Select(b => new BookmarkResponseDto
        {
            Id = b.Id,
            ItemId = b.ItemId,
            UserId = b.UserId,
            Note = b.Note,
            CreatedAtUtc = b.CreatedAtUtc,
            Item = b.Item == null ? null : MapItemToDto(b.Item, true)
        }).ToList();
    }

    public async Task<bool> ToggleBookmarkAsync(Guid itemId, string userId, string? note = null)
    {
        var existing = await _context.Bookmarks
            .FirstOrDefaultAsync(b => b.ItemId == itemId && b.UserId == userId);

        if (existing != null)
        {
            _context.Bookmarks.Remove(existing);
            await _context.SaveChangesAsync();
            return false; // Removed
        }

        var newBookmark = new Bookmark
        {
            ItemId = itemId,
            UserId = userId,
            Note = note,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Bookmarks.Add(newBookmark);
        await _context.SaveChangesAsync();
        return true; // Added
    }

    public async Task<bool> IsBookmarkedAsync(Guid itemId, string userId)
    {
        return await _context.Bookmarks
            .AnyAsync(b => b.ItemId == itemId && b.UserId == userId);
    }

    public async Task<bool> DeleteBookmarkAsync(Guid itemId, string userId)
    {
        var existing = await _context.Bookmarks
            .FirstOrDefaultAsync(b => b.ItemId == itemId && b.UserId == userId);

        if (existing == null) return false;

        _context.Bookmarks.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }

    private static CurrentAffairItemDto MapItemToDto(CurrentAffairItem item, bool isBookmarked)
    {
        var bulletEn = DeserializeList(item.BulletPointsEnJson);
        var bulletHi = DeserializeList(item.BulletPointsHiJson);

        return new CurrentAffairItemDto
        {
            Id = item.Id,
            DigestId = item.DigestId,
            DigestDate = item.Digest?.DigestDate ?? DateOnly.FromDateTime(item.CreatedAtUtc),
            CategoryId = item.CategoryId,
            CategoryNameEn = item.Category?.NameEn ?? string.Empty,
            CategoryNameHi = item.Category?.NameHi ?? string.Empty,
            CategoryIcon = item.Category?.Icon ?? "file-text",
            TitleEn = item.TitleEn,
            TitleHi = item.TitleHi,
            SummaryEn = item.SummaryEn,
            SummaryHi = item.SummaryHi,
            BulletPointsEn = bulletEn,
            BulletPointsHi = bulletHi,
            BankingTakeawayEn = item.BankingTakeawayEn,
            BankingTakeawayHi = item.BankingTakeawayHi,
            StaticGkFactEn = item.StaticGkFactEn,
            StaticGkFactHi = item.StaticGkFactHi,
            Importance = item.Importance,
            TargetExams = item.TargetExams,
            KeywordsList = (item.Keywords ?? string.Empty).Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries).ToList(),
            SourceName = item.SourceName,
            SourceUrl = item.SourceUrl,
            DisplayOrder = item.DisplayOrder,
            IsFeatured = item.IsFeatured,
            IsBookmarked = isBookmarked,
            CreatedAtUtc = item.CreatedAtUtc
        };
    }

    private static List<string> DeserializeList(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<string>();
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return new List<string> { json };
        }
    }
}
