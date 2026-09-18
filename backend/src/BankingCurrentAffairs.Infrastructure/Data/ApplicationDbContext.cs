using BankingCurrentAffairs.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace BankingCurrentAffairs.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<DailyAffairDigest> DailyAffairDigests => Set<DailyAffairDigest>();
    public DbSet<CurrentAffairItem> CurrentAffairItems => Set<CurrentAffairItem>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Bookmark> Bookmarks => Set<Bookmark>();
    public DbSet<JobExecutionLog> JobExecutionLogs => Set<JobExecutionLog>();
    public DbSet<ExpectedQuestion> ExpectedQuestions => Set<ExpectedQuestion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
