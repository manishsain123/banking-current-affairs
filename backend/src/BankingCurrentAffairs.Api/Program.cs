using BankingCurrentAffairs.Api.Middleware;
using BankingCurrentAffairs.Core.Interfaces;
using BankingCurrentAffairs.Infrastructure.Data;
using BankingCurrentAffairs.Infrastructure.Jobs;
using BankingCurrentAffairs.Infrastructure.Services;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.MemoryStorage;
using Hangfire.PostgreSql;
using Hangfire.SqlServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Cloud Port Binding (Render injects PORT)
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// 1. Database Configuration
var dbProvider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
var envDatabaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    if (!string.IsNullOrWhiteSpace(envDatabaseUrl) || dbProvider.Equals("PostgreSql", StringComparison.OrdinalIgnoreCase))
    {
        var rawConn = !string.IsNullOrWhiteSpace(envDatabaseUrl)
            ? envDatabaseUrl
            : (builder.Configuration.GetConnectionString("PostgreSqlConnection")
               ?? throw new InvalidOperationException("PostgreSqlConnection string missing."));

        var pgConn = ConvertPostgresUrlToConnectionString(rawConn);
        options.UseNpgsql(pgConn);
    }
    else if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        var sqlConn = builder.Configuration.GetConnectionString("SqlServerConnection")
            ?? throw new InvalidOperationException("SqlServerConnection string missing.");
        options.UseSqlServer(sqlConn);
    }
    else
    {
        // Default: SQLite for effortless local dev & verification
        var sqliteConn = builder.Configuration.GetConnectionString("SqliteConnection") ?? "Data Source=banking_current_affairs.db";
        options.UseSqlite(sqliteConn);
    }
});

// 2. Register Application & Domain Services
builder.Services.AddScoped<ICurrentAffairsService, CurrentAffairsService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IBookmarkService, BookmarkService>();
builder.Services.AddScoped<IDailyNotesJobService, DailyNotesHangfireJob>();
builder.Services.AddScoped<DailyNotesHangfireJob>();

// Register HTTP Client for LLM (Gemini/OpenAI)
builder.Services.AddHttpClient<ILlmCurrentAffairsService, GeminiCurrentAffairsService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(60);
});

builder.Services.AddHttpClient<IAiAnalysisService, AiAnalysisService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(90);
});

builder.Services.AddScoped<IExamQuestionService, ExamQuestionService>();

// 3. Configure Hangfire Background Automation
var hangfireStorageType = builder.Configuration["HangfireSettings:Storage"] ?? "Memory";

builder.Services.AddHangfire(config =>
{
    config.SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
          .UseSimpleAssemblyNameTypeSerializer()
          .UseRecommendedSerializerSettings();

    if (hangfireStorageType.Equals("PostgreSql", StringComparison.OrdinalIgnoreCase))
    {
        var pgConn = builder.Configuration.GetConnectionString("PostgreSqlConnection");
        config.UsePostgreSqlStorage(c => c.UseNpgsqlConnection(pgConn));
    }
    else if (hangfireStorageType.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        var sqlConn = builder.Configuration.GetConnectionString("SqlServerConnection");
        config.UseSqlServerStorage(sqlConn);
    }
    else
    {
        config.UseMemoryStorage();
    }
});

builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = Environment.ProcessorCount * 2;
});

// 4. Controllers with JSON String Enum Conversion
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// 5. CORS Configuration
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:4200", "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 6. Swagger / OpenAPI Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Daily Current Affairs API - Banking Exams",
        Version = "v1",
        Description = "Automated bilingual daily current affairs API for Banking & Insurance exams (SBI PO, IBPS PO, Clerk, RBI Grade B, LIC AAO).",
        Contact = new OpenApiContact
        {
            Name = "Banking Exam Prep Engineering",
            Email = "support@bankingprep.local"
        }
    });
});

var app = builder.Build();

// 7. Auto-migration & Database Seeding
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Ensuring database schema exists...");
        await db.Database.EnsureCreatedAsync();
        logger.LogInformation("Database verified. Seeding initial categories and current affairs...");
        await DatabaseSeeder.SeedAsync(db);
        logger.LogInformation("Database seeded successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database initialization/seeding.");
    }
}

// 8. Pipeline Middlewares
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Banking Current Affairs API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("CorsPolicy");
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();

// 9. Hangfire Dashboard with Custom Dev Authorization Filter
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new LocalDashboardAuthorizationFilter() },
    DashboardTitle = "Banking Notes Automation Dashboard"
});

// 10. Schedule 5:00 AM Daily Recurring Job in Hangfire
var cronExpression = builder.Configuration["HangfireSettings:CronExpression"] ?? "0 5 * * *";
RecurringJob.AddOrUpdate<DailyNotesHangfireJob>(
    "daily-banking-notes-sync",
    job => job.ExecuteDailyNotesGenerationAsync(DateOnly.FromDateTime(DateTime.UtcNow), "Hangfire Scheduled (5:00 AM IST)", CancellationToken.None),
    cronExpression
);

app.MapControllers();

// SPA fallback: serve index.html for all non-API/Swagger Angular routes
app.MapFallbackToFile("index.html");

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    timestamp = DateTime.UtcNow,
    app = "Banking Current Affairs Web API (.NET 8)",
    version = "1.0.0"
}));

app.Run();

/// <summary>
/// Converts postgres://user:password@host:port/dbname URI from Render/Cloud into Npgsql standard connection string
/// </summary>
static string ConvertPostgresUrlToConnectionString(string databaseUrl)
{
    if (!databaseUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
        !databaseUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        return databaseUrl;
    }

    try
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':');
        var user = userInfo[0];
        var pass = userInfo.Length > 1 ? userInfo[1] : "";
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');

        return $"Host={host};Port={port};Database={database};Username={user};Password={pass};SSL Mode=Require;Trust Server Certificate=true;";
    }
    catch
    {
        return databaseUrl;
    }
}

/// <summary>
/// Hangfire dashboard authorization filter allowing local access
/// </summary>
public class LocalDashboardAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) => true;
}
