using BankingCurrentAffairs.Core.DTOs;

namespace BankingCurrentAffairs.Core.Interfaces;

public interface IExamQuestionService
{
    Task<List<MonthArchiveSummaryDto>> GetAvailableMonthsAsync();
    Task<List<ExpectedQuestionDto>> GetQuestionsByMonthAsync(string monthYear, int? categoryId = null, string? difficulty = null, string? questionType = null, string? targetGroup = null);
    Task<ExpectedQuestionDto?> GetQuestionByIdAsync(Guid id);
    Task<GenerateQuestionsResponseDto> GenerateAndSaveMonthQuestionsAsync(string monthYear, CancellationToken cancellationToken = default);
    Task<bool> DeleteQuestionAsync(Guid id);
}
