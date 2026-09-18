using BankingCurrentAffairs.Core.DTOs;

namespace BankingCurrentAffairs.Core.Interfaces;

public interface ICurrentAffairsService
{
    Task<DailyDigestDto?> GetDailyDigestByDateAsync(DateOnly date, string? userId = null);
    Task<DailyDigestDto?> GetLatestDailyDigestAsync(string? userId = null);
    Task<List<DateOnly>> GetAvailableDigestDatesAsync(int? year = null, int? month = null);
    Task<List<CurrentAffairItemDto>> SearchCurrentAffairsAsync(FilterParamsDto filter);
    Task<CurrentAffairItemDto?> GetItemByIdAsync(Guid id, string? userId = null);
    Task<CurrentAffairItemDto> CreateItemAsync(CreateOrUpdateAffairDto dto);
    Task<CurrentAffairItemDto?> UpdateItemAsync(Guid id, CreateOrUpdateAffairDto dto);
    Task<bool> DeleteItemAsync(Guid id);
}
