using BankingCurrentAffairs.Core.DTOs;

namespace BankingCurrentAffairs.Core.Interfaces;

public interface IDailyNotesJobService
{
    Task<TriggerJobResponseDto> ExecuteDailyNotesGenerationAsync(DateOnly targetDate, string triggerSource, CancellationToken cancellationToken = default);
}
