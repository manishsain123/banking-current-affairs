using BankingCurrentAffairs.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BankingCurrentAffairs.Infrastructure.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedOnAdd();

        builder.Property(c => c.NameEn).IsRequired().HasMaxLength(150);
        builder.Property(c => c.NameHi).IsRequired().HasMaxLength(150);
        builder.Property(c => c.Slug).IsRequired().HasMaxLength(100);
        builder.HasIndex(c => c.Slug).IsUnique();

        builder.Property(c => c.DescriptionEn).HasMaxLength(500);
        builder.Property(c => c.DescriptionHi).HasMaxLength(500);
        builder.Property(c => c.Icon).HasMaxLength(50);
    }
}
