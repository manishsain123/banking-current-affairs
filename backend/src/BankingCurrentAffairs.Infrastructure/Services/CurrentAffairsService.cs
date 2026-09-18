using BankingCurrentAffairs.Core.DTOs;
using BankingCurrentAffairs.Core.Entities;
using BankingCurrentAffairs.Core.Enums;
using BankingCurrentAffairs.Core.Interfaces;
using BankingCurrentAffairs.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BankingCurrentAffairs.Infrastructure.Services;

public class CurrentAffairsService : ICurrentAffairsService
{
    private readonly ApplicationDbContext _context;

    public CurrentAffairsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DailyDigestDto?> GetDailyDigestByDateAsync(DateOnly date, string? userId = null)
    {
        var digest = await _context.DailyAffairDigests
            .Include(d => d.Items.OrderBy(i => i.DisplayOrder))
                .ThenInclude(i => i.Category)
            .FirstOrDefaultAsync(d => d.DigestDate == date);

        if (digest == null) return null;

        var bookmarkedItemIds = new HashSet<Guid>();
        if (!string.IsNullOrWhiteSpace(userId))
        {
            var itemIds = digest.Items.Select(i => i.Id).ToList();
            bookmarkedItemIds = (await _context.Bookmarks
                .Where(b => b.UserId == userId && itemIds.Contains(b.ItemId))
                .Select(b => b.ItemId)
                .ToListAsync())
                .ToHashSet();
        }

        return MapDigestToDto(digest, bookmarkedItemIds);
    }

    public async Task<DailyDigestDto?> GetLatestDailyDigestAsync(string? userId = null)
    {
        var latestDate = await _context.DailyAffairDigests
            .OrderByDescending(d => d.DigestDate)
            .Select(d => (DateOnly?)d.DigestDate)
            .FirstOrDefaultAsync();

        if (latestDate == null) return null;

        return await GetDailyDigestByDateAsync(latestDate.Value, userId);
    }

    public async Task<List<DateOnly>> GetAvailableDigestDatesAsync(int? year = null, int? month = null)
    {
        var query = _context.DailyAffairDigests.AsQueryable();

        if (year.HasValue)
        {
            query = query.Where(d => d.DigestDate.Year == year.Value);
            if (month.HasValue)
            {
                query = query.Where(d => d.DigestDate.Month == month.Value);
            }
        }

        return await query
            .OrderByDescending(d => d.DigestDate)
            .Select(d => d.DigestDate)
            .ToListAsync();
    }

    public async Task<List<CurrentAffairItemDto>> SearchCurrentAffairsAsync(FilterParamsDto filter)
    {
        var query = _context.CurrentAffairItems
            .Include(i => i.Category)
            .Include(i => i.Digest)
            .AsQueryable();

        if (filter.Date.HasValue)
        {
            query = query.Where(i => i.Digest != null && i.Digest.DigestDate == filter.Date.Value);
        }
        else
        {
            if (filter.StartDate.HasValue)
                query = query.Where(i => i.Digest != null && i.Digest.DigestDate >= filter.StartDate.Value);
            if (filter.EndDate.HasValue)
                query = query.Where(i => i.Digest != null && i.Digest.DigestDate <= filter.EndDate.Value);
        }

        if (filter.CategoryId.HasValue && filter.CategoryId.Value > 0)
        {
            query = query.Where(i => i.CategoryId == filter.CategoryId.Value);
        }

        if (filter.ExamTag.HasValue && filter.ExamTag.Value != ExamTag.AllBanking)
        {
            query = query.Where(i => i.TargetExams == filter.ExamTag.Value || i.TargetExams == ExamTag.AllBanking);
        }

        if (filter.Importance.HasValue)
        {
            query = query.Where(i => i.Importance == filter.Importance.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchQuery))
        {
            var search = filter.SearchQuery.Trim().ToLower();
            query = query.Where(i =>
                i.TitleEn.ToLower().Contains(search) ||
                i.TitleHi.ToLower().Contains(search) ||
                i.SummaryEn.ToLower().Contains(search) ||
                i.SummaryHi.ToLower().Contains(search) ||
                i.Keywords.ToLower().Contains(search) ||
                i.BankingTakeawayEn.ToLower().Contains(search) ||
                i.BankingTakeawayHi.ToLower().Contains(search));
        }

        var skip = Math.Max(0, (filter.PageNumber - 1) * filter.PageSize);
        var items = await query
            .OrderByDescending(i => i.Digest != null ? i.Digest.DigestDate : DateOnly.MinValue)
            .ThenBy(i => i.DisplayOrder)
            .Skip(skip)
            .Take(filter.PageSize)
            .ToListAsync();

        var bookmarkedItemIds = new HashSet<Guid>();
        if (!string.IsNullOrWhiteSpace(filter.UserId))
        {
            var itemIds = items.Select(i => i.Id).ToList();
            bookmarkedItemIds = (await _context.Bookmarks
                .Where(b => b.UserId == filter.UserId && itemIds.Contains(b.ItemId))
                .Select(b => b.ItemId)
                .ToListAsync())
                .ToHashSet();
        }

        return items.Select(i => MapItemToDto(i, bookmarkedItemIds.Contains(i.Id))).ToList();
    }

    public async Task<CurrentAffairItemDto?> GetItemByIdAsync(Guid id, string? userId = null)
    {
        var item = await _context.CurrentAffairItems
            .Include(i => i.Category)
            .Include(i => i.Digest)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null) return null;

        var isBookmarked = false;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            isBookmarked = await _context.Bookmarks
                .AnyAsync(b => b.UserId == userId && b.ItemId == id);
        }

        return MapItemToDto(item, isBookmarked);
    }

    public async Task<CurrentAffairItemDto> CreateItemAsync(CreateOrUpdateAffairDto dto)
    {
        // Find or create Digest for target date
        var digest = await _context.DailyAffairDigests
            .FirstOrDefaultAsync(d => d.DigestDate == dto.DigestDate);

        if (digest == null)
        {
            digest = new DailyAffairDigest
            {
                Id = Guid.NewGuid(),
                DigestDate = dto.DigestDate,
                TitleEn = $"Daily Banking Current Affairs - {dto.DigestDate:dd MMMM yyyy}",
                TitleHi = $"दैनिक बैंकिंग समसामयिकी - {dto.DigestDate:dd MMMM yyyy}",
                OverviewEn = "Comprehensive daily notes covering banking regulations, financial awareness, and exam-oriented news.",
                OverviewHi = "बैंकिंग नियमों, वित्तीय जागरूकता और परीक्षा-उन्मुख समाचारों को कवर करने वाले व्यापक दैनिक नोट्स।",
                Status = PublishStatus.Published,
                PublishedAtUtc = DateTime.UtcNow,
                GeneratedBy = "Admin Manual Entry"
            };
            _context.DailyAffairDigests.Add(digest);
            await _context.SaveChangesAsync();
        }

        var item = new CurrentAffairItem
        {
            Id = Guid.NewGuid(),
            DigestId = digest.Id,
            CategoryId = dto.CategoryId,
            TitleEn = dto.TitleEn,
            TitleHi = dto.TitleHi,
            SummaryEn = dto.SummaryEn,
            SummaryHi = dto.SummaryHi,
            BulletPointsEnJson = JsonSerializer.Serialize(dto.BulletPointsEn),
            BulletPointsHiJson = JsonSerializer.Serialize(dto.BulletPointsHi),
            BankingTakeawayEn = dto.BankingTakeawayEn,
            BankingTakeawayHi = dto.BankingTakeawayHi,
            StaticGkFactEn = dto.StaticGkFactEn,
            StaticGkFactHi = dto.StaticGkFactHi,
            Importance = dto.Importance,
            TargetExams = dto.TargetExams,
            Keywords = dto.Keywords,
            SourceName = dto.SourceName,
            SourceUrl = dto.SourceUrl,
            DisplayOrder = dto.DisplayOrder,
            IsFeatured = dto.IsFeatured,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.CurrentAffairItems.Add(item);
        await _context.SaveChangesAsync();

        // Reload category & digest details
        await _context.Entry(item).Reference(i => i.Category).LoadAsync();
        await _context.Entry(item).Reference(i => i.Digest).LoadAsync();

        return MapItemToDto(item, false);
    }

    public async Task<CurrentAffairItemDto?> UpdateItemAsync(Guid id, CreateOrUpdateAffairDto dto)
    {
        var item = await _context.CurrentAffairItems
            .Include(i => i.Category)
            .Include(i => i.Digest)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null) return null;

        item.CategoryId = dto.CategoryId;
        item.TitleEn = dto.TitleEn;
        item.TitleHi = dto.TitleHi;
        item.SummaryEn = dto.SummaryEn;
        item.SummaryHi = dto.SummaryHi;
        item.BulletPointsEnJson = JsonSerializer.Serialize(dto.BulletPointsEn);
        item.BulletPointsHiJson = JsonSerializer.Serialize(dto.BulletPointsHi);
        item.BankingTakeawayEn = dto.BankingTakeawayEn;
        item.BankingTakeawayHi = dto.BankingTakeawayHi;
        item.StaticGkFactEn = dto.StaticGkFactEn;
        item.StaticGkFactHi = dto.StaticGkFactHi;
        item.Importance = dto.Importance;
        item.TargetExams = dto.TargetExams;
        item.Keywords = dto.Keywords;
        item.SourceName = dto.SourceName;
        item.SourceUrl = dto.SourceUrl;
        item.DisplayOrder = dto.DisplayOrder;
        item.IsFeatured = dto.IsFeatured;
        item.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        await _context.Entry(item).Reference(i => i.Category).LoadAsync();

        return MapItemToDto(item, false);
    }

    public async Task<bool> DeleteItemAsync(Guid id)
    {
        var item = await _context.CurrentAffairItems.FindAsync(id);
        if (item == null) return false;

        _context.CurrentAffairItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    // Mapping Helpers
    private static DailyDigestDto MapDigestToDto(DailyAffairDigest digest, HashSet<Guid> bookmarkedItemIds)
    {
        var metrics = new List<BankingMetricDto>();
        if (!string.IsNullOrWhiteSpace(digest.BankingKeyMetricsJson))
        {
            try
            {
                metrics = JsonSerializer.Deserialize<List<BankingMetricDto>>(digest.BankingKeyMetricsJson) ?? new();
            }
            catch { }
        }

        return new DailyDigestDto
        {
            Id = digest.Id,
            DigestDate = digest.DigestDate,
            TitleEn = digest.TitleEn,
            TitleHi = digest.TitleHi,
            OverviewEn = digest.OverviewEn,
            OverviewHi = digest.OverviewHi,
            BankingKeyMetrics = metrics,
            Status = digest.Status,
            PublishedAtUtc = digest.PublishedAtUtc,
            GeneratedBy = digest.GeneratedBy,
            Items = digest.Items.Select(i => MapItemToDto(i, bookmarkedItemIds.Contains(i.Id))).ToList()
        };
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
            CategoryNameEn = item.Category?.NameEn ?? "Banking",
            CategoryNameHi = item.Category?.NameHi ?? "बैंकिंग",
            CategoryIcon = item.Category?.Icon ?? "landmark",
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
