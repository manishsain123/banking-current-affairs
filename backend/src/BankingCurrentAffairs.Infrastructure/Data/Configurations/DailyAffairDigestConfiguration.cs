using BankingCurrentAffairs.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BankingCurrentAffairs.Infrastructure.Data.Configurations;

public class DailyAffairDigestConfiguration : IEntityTypeConfiguration<DailyAffairDigest>
{
    public void Configure(EntityTypeBuilder<DailyAffairDigest> builder)
    {
        builder.ToTable("DailyAffairDigests");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.DigestDate).IsRequired();
        builder.HasIndex(d => d.DigestDate).IsUnique();

        builder.Property(d => d.TitleEn).IsRequired().HasMaxLength(300);
        builder.Property(d => d.TitleHi).IsRequired().HasMaxLength(300);

        builder.Property(d => d.OverviewEn).HasMaxLength(2000);
        builder.Property(d => d.OverviewHi).HasMaxLength(2000);

        builder.Property(d => d.BankingKeyMetricsJson).HasColumnType("text");

        builder.HasMany(d => d.Items)
            .WithOne(i => i.Digest)
            .HasForeignKey(i => i.DigestId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
