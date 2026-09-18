using BankingCurrentAffairs.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BankingCurrentAffairs.Infrastructure.Data.Configurations;

public class ExpectedQuestionConfiguration : IEntityTypeConfiguration<ExpectedQuestion>
{
    public void Configure(EntityTypeBuilder<ExpectedQuestion> builder)
    {
        builder.ToTable("ExpectedQuestions");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.MonthYear).IsRequired().HasMaxLength(10);
        builder.Property(q => q.MonthYearDisplay).IsRequired().HasMaxLength(50);

        builder.Property(q => q.QuestionType).HasMaxLength(50);
        builder.Property(q => q.DifficultyLevel).HasMaxLength(50);
        builder.Property(q => q.TargetExam).HasMaxLength(100);

        builder.Property(q => q.QuestionEn).IsRequired().HasColumnType("text");
        builder.Property(q => q.QuestionHi).IsRequired().HasColumnType("text");

        builder.Property(q => q.OptionsEnJson).IsRequired().HasColumnType("text");
        builder.Property(q => q.OptionsHiJson).IsRequired().HasColumnType("text");

        builder.Property(q => q.CorrectAnswer).IsRequired().HasMaxLength(10);

        builder.Property(q => q.ExplanationEn).HasColumnType("text");
        builder.Property(q => q.ExplanationHi).HasColumnType("text");

        builder.Property(q => q.DeepAnalysisEn).HasColumnType("text");
        builder.Property(q => q.DeepAnalysisHi).HasColumnType("text");

        builder.Property(q => q.StaticConceptLinkEn).HasMaxLength(1000);
        builder.Property(q => q.StaticConceptLinkHi).HasMaxLength(1000);

        builder.Property(q => q.ExaminerTrapWarningEn).HasMaxLength(1000);
        builder.Property(q => q.ExaminerTrapWarningHi).HasMaxLength(1000);

        builder.HasOne(q => q.Category)
            .WithMany()
            .HasForeignKey(q => q.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(q => q.RelatedAffairItem)
            .WithMany()
            .HasForeignKey(q => q.RelatedAffairItemId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(q => q.MonthYear);
        builder.HasIndex(q => q.CategoryId);
        builder.HasIndex(q => q.QuestionType);
        builder.HasIndex(q => q.DifficultyLevel);
    }
}
