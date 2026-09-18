using BankingCurrentAffairs.Core.Enums;

namespace BankingCurrentAffairs.Core.DTOs;

public class TriggerJobResponseDto
{
    public Guid ExecutionId { get; set; }
    public string JobName { get; set; } = string.Empty;
    public DateOnly TargetDate { get; set; }
    public JobStatus Status { get; set; }
    public string StatusText => Status.ToString();
    public int ItemsCreatedOrUpdated { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
}
