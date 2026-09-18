using BankingCurrentAffairs.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BankingCurrentAffairs.Infrastructure.Data.Configurations;

public class JobExecutionLogConfiguration : IEntityTypeConfiguration<JobExecutionLog>
{
    public void Configure(EntityTypeBuilder<JobExecutionLog> builder)
    {
        builder.ToTable("JobExecutionLogs");

        builder.HasKey(j => j.Id);

        builder.Property(j => j.JobName).IsRequired().HasMaxLength(150);
        builder.Property(j => j.TriggerSource).HasMaxLength(100);
        builder.Property(j => j.LogMessage).HasMaxLength(2000);
        builder.Property(j => j.ErrorDetails).HasColumnType("text");

        builder.HasIndex(j => j.StartedAtUtc);
        builder.HasIndex(j => j.TargetDate);
    }
}
