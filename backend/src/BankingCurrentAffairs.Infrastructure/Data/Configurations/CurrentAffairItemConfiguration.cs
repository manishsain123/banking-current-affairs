using BankingCurrentAffairs.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BankingCurrentAffairs.Infrastructure.Data.Configurations;

public class CurrentAffairItemConfiguration : IEntityTypeConfiguration<CurrentAffairItem>
{
    public void Configure(EntityTypeBuilder<CurrentAffairItem> builder)
    {
        builder.ToTable("CurrentAffairItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TitleEn).IsRequired().HasMaxLength(400);
        builder.Property(i => i.TitleHi).IsRequired().HasMaxLength(400);

        builder.Property(i => i.SummaryEn).IsRequired().HasMaxLength(3000);
        builder.Property(i => i.SummaryHi).IsRequired().HasMaxLength(3000);

        builder.Property(i => i.BulletPointsEnJson).HasColumnType("text");
        builder.Property(i => i.BulletPointsHiJson).HasColumnType("text");

        builder.Property(i => i.BankingTakeawayEn).HasMaxLength(1500);
        builder.Property(i => i.BankingTakeawayHi).HasMaxLength(1500);

        builder.Property(i => i.StaticGkFactEn).HasMaxLength(1000);
        builder.Property(i => i.StaticGkFactHi).HasMaxLength(1000);

        builder.Property(i => i.Keywords).HasMaxLength(500);
        builder.Property(i => i.SourceName).HasMaxLength(150);
        builder.Property(i => i.SourceUrl).HasMaxLength(1000);

        builder.HasOne(i => i.Category)
            .WithMany(c => c.Items)
            .HasForeignKey(i => i.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(i => i.CategoryId);
        builder.HasIndex(i => i.Importance);
        builder.HasIndex(i => i.TargetExams);
    }
}
