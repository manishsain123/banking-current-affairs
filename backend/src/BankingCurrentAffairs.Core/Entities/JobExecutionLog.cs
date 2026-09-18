using BankingCurrentAffairs.Core.Enums;

namespace BankingCurrentAffairs.Core.Entities;

public class JobExecutionLog : BaseEntity
{
    public string JobName { get; set; } = "DailyCurrentAffairsSyncJob";
    public DateOnly TargetDate { get; set; }
    public DateTime StartedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAtUtc { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Running;
    public int ItemsCreatedOrUpdated { get; set; } = 0;
    public string? LogMessage { get; set; }
    public string? ErrorDetails { get; set; }
    public string TriggerSource { get; set; } = "Hangfire Scheduler"; // e.g. "Hangfire Scheduler" or "Manual Admin Trigger"
}
