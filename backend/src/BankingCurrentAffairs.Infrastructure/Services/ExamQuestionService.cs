using BankingCurrentAffairs.Core.DTOs;
using BankingCurrentAffairs.Core.Entities;
using BankingCurrentAffairs.Core.Interfaces;
using BankingCurrentAffairs.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace BankingCurrentAffairs.Infrastructure.Services;

public class ExamQuestionService : IExamQuestionService
{
    private readonly ApplicationDbContext _context;
    private readonly IAiAnalysisService _aiAnalysisService;
    private readonly ILogger<ExamQuestionService> _logger;

    public ExamQuestionService(
        ApplicationDbContext context,
        IAiAnalysisService aiAnalysisService,
        ILogger<ExamQuestionService> logger)
    {
        _context = context;
        _aiAnalysisService = aiAnalysisService;
        _logger = logger;
    }

    public async Task<List<MonthArchiveSummaryDto>> GetAvailableMonthsAsync()
    {
        // Get all distinct months from digests and questions
        var digestDates = await _context.DailyAffairDigests
            .Select(d => d.DigestDate)
            .ToListAsync();

        var existingQuestionMonths = await _context.ExpectedQuestions
            .GroupBy(q => q.MonthYear)
            .Select(g => new { MonthYear = g.Key, Count = g.Count() })
            .ToDictionaryAsync(g => g.MonthYear, g => g.Count);

        var monthGroups = digestDates
            .Select(d => $"{d.Year:D4}-{d.Month:D2}")
            .Union(existingQuestionMonths.Keys)
            .Distinct()
            .OrderByDescending(m => m)
            .ToList();

        var result = new List<MonthArchiveSummaryDto>();

        foreach (var my in monthGroups)
        {
            var parts = my.Split('-');
            var year = int.Parse(parts[0]);
            var month = int.Parse(parts[1]);
            var display = new DateTime(year, month, 1).ToString("MMMM yyyy");

            var qCount = existingQuestionMonths.TryGetValue(my, out var count) ? count : 0;
            var caCount = digestDates.Count(d => d.Year == year && d.Month == month);

            result.Add(new MonthArchiveSummaryDto
            {
                MonthYear = my,
                MonthYearDisplay = display,
                QuestionCount = qCount,
                CurrentAffairsCount = caCount,
                IsAnalyzed = qCount > 0
            });
        }

        return result;
    }

    public async Task<List<ExpectedQuestionDto>> GetQuestionsByMonthAsync(
        string monthYear,
        int? categoryId = null,
        string? difficulty = null,
        string? questionType = null)
    {
        var query = _context.ExpectedQuestions
            .Include(q => q.Category)
            .Where(q => q.MonthYear == monthYear)
            .AsQueryable();

        if (categoryId.HasValue && categoryId.Value > 0)
        {
            query = query.Where(q => q.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(difficulty) && difficulty != "All")
        {
            query = query.Where(q => q.DifficultyLevel == difficulty);
        }

        if (!string.IsNullOrWhiteSpace(questionType) && questionType != "All")
        {
            query = query.Where(q => q.QuestionType == questionType);
        }

        var list = await query
            .OrderByDescending(q => q.CreatedAtUtc)
            .ToListAsync();

        return list.Select(MapToDto).ToList();
    }

    public async Task<ExpectedQuestionDto?> GetQuestionByIdAsync(Guid id)
    {
        var item = await _context.ExpectedQuestions
            .Include(q => q.Category)
            .FirstOrDefaultAsync(q => q.Id == id);

        return item == null ? null : MapToDto(item);
    }

    public async Task<GenerateQuestionsResponseDto> GenerateAndSaveMonthQuestionsAsync(string monthYear, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating expected questions for month {MonthYear}", monthYear);

        var generated = await _aiAnalysisService.AnalyzeAndGenerateForMonthAsync(monthYear, cancellationToken);
        var categories = await _context.Categories.ToListAsync(cancellationToken);
        var defaultCategory = categories.FirstOrDefault()?.Id ?? 1;

        var parts = monthYear.Split('-');
        var year = int.TryParse(parts[0], out var y) ? y : DateTime.UtcNow.Year;
        var month = parts.Length > 1 && int.TryParse(parts[1], out var m) ? m : DateTime.UtcNow.Month;
        var display = new DateTime(year, month, 1).ToString("MMMM yyyy");

        var newEntities = new List<ExpectedQuestion>();

        foreach (var g in generated)
        {
            var category = categories.FirstOrDefault(c =>
                c.Slug.Equals(g.CategorySlug, StringComparison.OrdinalIgnoreCase) ||
                c.NameEn.Contains(g.CategorySlug, StringComparison.OrdinalIgnoreCase))
                ?? categories.FirstOrDefault();

            var entity = new ExpectedQuestion
            {
                Id = Guid.NewGuid(),
                MonthYear = monthYear,
                MonthYearDisplay = display,
                CategoryId = category?.Id ?? defaultCategory,
                QuestionType = g.QuestionType,
                DifficultyLevel = g.DifficultyLevel,
                TargetExam = g.TargetExam,
                QuestionEn = g.QuestionEn,
                QuestionHi = g.QuestionHi,
                OptionsEnJson = JsonSerializer.Serialize(g.OptionsEn),
                OptionsHiJson = JsonSerializer.Serialize(g.OptionsHi),
                CorrectAnswer = g.CorrectAnswer,
                ExplanationEn = g.ExplanationEn,
                ExplanationHi = g.ExplanationHi,
                DeepAnalysisEn = g.DeepAnalysisEn,
                DeepAnalysisHi = g.DeepAnalysisHi,
                StaticConceptLinkEn = g.StaticConceptLinkEn,
                StaticConceptLinkHi = g.StaticConceptLinkHi,
                ExaminerTrapWarningEn = g.ExaminerTrapWarningEn,
                ExaminerTrapWarningHi = g.ExaminerTrapWarningHi,
                RelatedAffairItemId = g.RelatedAffairItemId,
                CreatedAtUtc = DateTime.UtcNow
            };

            newEntities.Add(entity);
        }

        await _context.ExpectedQuestions.AddRangeAsync(newEntities, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Fetch saved with categories loaded
        var savedDtos = await GetQuestionsByMonthAsync(monthYear);

        return new GenerateQuestionsResponseDto
        {
            MonthYear = monthYear,
            QuestionsGenerated = newEntities.Count,
            Message = $"Successfully synthesized {newEntities.Count} exam-grade expected questions for {display}.",
            Questions = savedDtos
        };
    }

    public async Task<bool> DeleteQuestionAsync(Guid id)
    {
        var entity = await _context.ExpectedQuestions.FindAsync(id);
        if (entity == null) return false;

        _context.ExpectedQuestions.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ExpectedQuestionDto MapToDto(ExpectedQuestion q)
    {
        var optionsEn = DeserializeList(q.OptionsEnJson);
        var optionsHi = DeserializeList(q.OptionsHiJson);

        return new ExpectedQuestionDto
        {
            Id = q.Id,
            MonthYear = q.MonthYear,
            MonthYearDisplay = q.MonthYearDisplay,
            CategoryId = q.CategoryId,
            CategoryNameEn = q.Category?.NameEn ?? "Banking & Finance",
            CategoryNameHi = q.Category?.NameHi ?? "बैंकिंग और वित्त",
            QuestionType = q.QuestionType,
            DifficultyLevel = q.DifficultyLevel,
            TargetExam = q.TargetExam,
            QuestionEn = q.QuestionEn,
            QuestionHi = q.QuestionHi,
            OptionsEn = optionsEn,
            OptionsHi = optionsHi,
            CorrectAnswer = q.CorrectAnswer,
            ExplanationEn = q.ExplanationEn,
            ExplanationHi = q.ExplanationHi,
            DeepAnalysisEn = q.DeepAnalysisEn,
            DeepAnalysisHi = q.DeepAnalysisHi,
            StaticConceptLinkEn = q.StaticConceptLinkEn,
            StaticConceptLinkHi = q.StaticConceptLinkHi,
            ExaminerTrapWarningEn = q.ExaminerTrapWarningEn,
            ExaminerTrapWarningHi = q.ExaminerTrapWarningHi,
            RelatedAffairItemId = q.RelatedAffairItemId,
            CreatedAtUtc = q.CreatedAtUtc
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
