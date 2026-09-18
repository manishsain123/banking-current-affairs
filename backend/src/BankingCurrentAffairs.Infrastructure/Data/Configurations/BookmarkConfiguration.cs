using BankingCurrentAffairs.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BankingCurrentAffairs.Infrastructure.Data.Configurations;

public class BookmarkConfiguration : IEntityTypeConfiguration<Bookmark>
{
    public void Configure(EntityTypeBuilder<Bookmark> builder)
    {
        builder.ToTable("Bookmarks");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.UserId).IsRequired().HasMaxLength(150);
        builder.Property(b => b.Note).HasMaxLength(500);

        builder.HasOne(b => b.Item)
            .WithMany(i => i.Bookmarks)
            .HasForeignKey(b => b.ItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // One bookmark per user per item
        builder.HasIndex(b => new { b.UserId, b.ItemId }).IsUnique();
    }
}
