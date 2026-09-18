using BankingCurrentAffairs.Core.DTOs;
using BankingCurrentAffairs.Core.Entities;
using BankingCurrentAffairs.Core.Enums;
using BankingCurrentAffairs.Core.Interfaces;
using BankingCurrentAffairs.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace BankingCurrentAffairs.Infrastructure.Jobs;

public class DailyNotesHangfireJob : IDailyNotesJobService
{
    private readonly ApplicationDbContext _context;
    private readonly ILlmCurrentAffairsService _llmService;
    private readonly ILogger<DailyNotesHangfireJob> _logger;

    public DailyNotesHangfireJob(
        ApplicationDbContext context,
        ILlmCurrentAffairsService llmService,
        ILogger<DailyNotesHangfireJob> logger)
    {
        _context = context;
        _llmService = llmService;
        _logger = logger;
    }

    /// <summary>
    /// Background job method called by Hangfire recurring scheduler or manual admin trigger.
    /// </summary>
    public async Task<TriggerJobResponseDto> ExecuteDailyNotesGenerationAsync(
        DateOnly targetDate,
        string triggerSource,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting automated Daily Notes Generation for {TargetDate} via {Source}", targetDate, triggerSource);

        var log = new JobExecutionLog
        {
            Id = Guid.NewGuid(),
            JobName = "DailyCurrentAffairsSyncJob",
            TargetDate = targetDate,
            StartedAtUtc = DateTime.UtcNow,
            Status = JobStatus.Running,
            TriggerSource = triggerSource,
            LogMessage = $"Job started for date {targetDate:yyyy-MM-dd}"
        };

        _context.JobExecutionLogs.Add(log);
        await _context.SaveChangesAsync(cancellationToken);

        try
        {
            // Call AI LLM service to synthesize & translate daily notes
            var generatedDigest = await _llmService.GenerateDigestForDateAsync(targetDate, cancellationToken);

            // Fetch existing digest if any, or create a new one
            var existingDigest = await _context.DailyAffairDigests
                .Include(d => d.Items)
                .FirstOrDefaultAsync(d => d.DigestDate == targetDate, cancellationToken);

            var categories = await _context.Categories.ToListAsync(cancellationToken);
            var defaultCategoryId = categories.FirstOrDefault()?.Id ?? 1;

            int itemsProcessed = 0;

            if (existingDigest == null)
            {
                existingDigest = new DailyAffairDigest
                {
                    Id = Guid.NewGuid(),
                    DigestDate = targetDate,
                    TitleEn = generatedDigest.TitleEn,
                    TitleHi = generatedDigest.TitleHi,
                    OverviewEn = generatedDigest.OverviewEn,
                    OverviewHi = generatedDigest.OverviewHi,
                    BankingKeyMetricsJson = JsonSerializer.Serialize(generatedDigest.BankingKeyMetrics),
                    Status = PublishStatus.Published,
                    PublishedAtUtc = DateTime.UtcNow,
                    GeneratedBy = triggerSource
                };

                _context.DailyAffairDigests.Add(existingDigest);
            }
            else
            {
                existingDigest.TitleEn = generatedDigest.TitleEn;
                existingDigest.TitleHi = generatedDigest.TitleHi;
                existingDigest.OverviewEn = generatedDigest.OverviewEn;
                existingDigest.OverviewHi = generatedDigest.OverviewHi;
                existingDigest.BankingKeyMetricsJson = JsonSerializer.Serialize(generatedDigest.BankingKeyMetrics);
                existingDigest.PublishedAtUtc = DateTime.UtcNow;
                existingDigest.GeneratedBy = $"{existingDigest.GeneratedBy} (Updated via {triggerSource})";
            }

            int order = existingDigest.Items.Count > 0 ? existingDigest.Items.Max(i => i.DisplayOrder) + 1 : 1;

            foreach (var itemResult in generatedDigest.Items)
            {
                // Find matching category by slug or name
                var category = categories.FirstOrDefault(c =>
                    c.Slug.Equals(itemResult.CategorySlug, StringComparison.OrdinalIgnoreCase) ||
                    c.NameEn.Contains(itemResult.CategorySlug, StringComparison.OrdinalIgnoreCase))
                    ?? categories.FirstOrDefault();

                var categoryId = category?.Id ?? defaultCategoryId;

                // Check if identical title already exists to prevent duplicate entries
                var titleEnTrimmed = itemResult.TitleEn.Trim();
                var alreadyExists = existingDigest.Items.Any(i =>
                    i.TitleEn.Equals(titleEnTrimmed, StringComparison.OrdinalIgnoreCase));

                if (!alreadyExists)
                {
                    var newItem = new CurrentAffairItem
                    {
                        Id = Guid.NewGuid(),
                        DigestId = existingDigest.Id,
                        CategoryId = categoryId,
                        TitleEn = itemResult.TitleEn,
                        TitleHi = itemResult.TitleHi,
                        SummaryEn = itemResult.SummaryEn,
                        SummaryHi = itemResult.SummaryHi,
                        BulletPointsEnJson = JsonSerializer.Serialize(itemResult.BulletPointsEn),
                        BulletPointsHiJson = JsonSerializer.Serialize(itemResult.BulletPointsHi),
                        BankingTakeawayEn = itemResult.BankingTakeawayEn,
                        BankingTakeawayHi = itemResult.BankingTakeawayHi,
                        StaticGkFactEn = itemResult.StaticGkFactEn,
                        StaticGkFactHi = itemResult.StaticGkFactHi,
                        Importance = ParseImportance(itemResult.Importance),
                        TargetExams = ParseExamTag(itemResult.TargetExams),
                        Keywords = itemResult.Keywords,
                        SourceName = itemResult.SourceName,
                        SourceUrl = itemResult.SourceUrl,
                        DisplayOrder = order++,
                        IsFeatured = order <= 2,
                        CreatedAtUtc = DateTime.UtcNow
                    };

                    existingDigest.Items.Add(newItem);
                    itemsProcessed++;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            log.Status = JobStatus.Success;
            log.CompletedAtUtc = DateTime.UtcNow;
            log.ItemsCreatedOrUpdated = itemsProcessed;
            log.LogMessage = $"Successfully processed {itemsProcessed} items for {targetDate:yyyy-MM-dd}.";
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Daily Notes Generation completed successfully for {TargetDate}. Added/updated {Count} items.", targetDate, itemsProcessed);

            return new TriggerJobResponseDto
            {
                ExecutionId = log.Id,
                JobName = log.JobName,
                TargetDate = targetDate,
                Status = JobStatus.Success,
                ItemsCreatedOrUpdated = itemsProcessed,
                Message = $"Successfully synthesized {itemsProcessed} bilingual current affairs for {targetDate:dd MMM yyyy}.",
                TimestampUtc = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during daily notes generation for {TargetDate}", targetDate);

            log.Status = JobStatus.Failed;
            log.CompletedAtUtc = DateTime.UtcNow;
            log.ErrorDetails = ex.ToString();
            log.LogMessage = $"Error: {ex.Message}";
            await _context.SaveChangesAsync(cancellationToken);

            return new TriggerJobResponseDto
            {
                ExecutionId = log.Id,
                JobName = log.JobName,
                TargetDate = targetDate,
                Status = JobStatus.Failed,
                ItemsCreatedOrUpdated = 0,
                Message = $"Job failed: {ex.Message}",
                TimestampUtc = DateTime.UtcNow
            };
        }
    }

    private static ImportanceLevel ParseImportance(string? val)
    {
        if (Enum.TryParse<ImportanceLevel>(val, true, out var level))
        {
            return level;
        }
        return ImportanceLevel.Standard;
    }

    private static ExamTag ParseExamTag(string? val)
    {
        if (Enum.TryParse<ExamTag>(val, true, out var tag))
        {
            return tag;
        }
        return ExamTag.AllBanking;
    }
}
