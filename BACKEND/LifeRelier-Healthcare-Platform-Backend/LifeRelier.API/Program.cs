using LifeRelier.Application.Interfaces;
using LifeRelier.Application.Interfaces.AI;
using LifeRelier.Infrastructure.AI.Options;
using LifeRelier.Infrastructure.AI.Providers;
using LifeRelier.Infrastructure.AI.Services;
using LifeRelier.Infrastructure.Persistence;
using LifeRelier.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

// Load environment variables from .env file up the directory tree
DotNetEnv.Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

// Map standard GEMINI_API_KEY environment variable to AiSettings:Gemini:ApiKey if set in .env
var geminiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
if (!string.IsNullOrWhiteSpace(geminiKey))
{
    builder.Configuration["AiSettings:Gemini:ApiKey"] = geminiKey;
}

builder.WebHost.ConfigureKestrel(options =>
{
    // HTTPS for Swagger on your laptop
    options.ListenLocalhost(60191, listenOptions =>
    {
        listenOptions.UseHttps();
    });

    // HTTP for mobile devices on the same Wi-Fi
    options.ListenAnyIP(60192);
});
// CORS Policy Setup
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Add API Controllers
builder.Services.AddControllers();

// Configure EF Core DbContext with SQL Server ConnectionString
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<LifeRelierDbContext>(options =>
    options.UseSqlServer(connectionString));

// Register IPrescriptionService in DI
builder.Services.AddScoped<IPrescriptionService, PrescriptionService>();

// AI Options & Dependency Injection Setup
builder.Services.Configure<GeminiOptions>(builder.Configuration.GetSection(GeminiOptions.SectionName));

// Configure Typed HttpClient for Gemini AI Provider with Timeout Settings
builder.Services.AddHttpClient<IAIProvider, GeminiProvider>((serviceProvider, client) =>
{
    var options = serviceProvider.GetRequiredService<IOptions<GeminiOptions>>().Value;
    var timeoutSeconds = options.TimeoutSeconds > 0 ? options.TimeoutSeconds : 30;
    client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
});

// Primary AI Service Injection (Gemini-powered)
builder.Services.AddScoped<IAIService, GeminiService>();
builder.Services.AddScoped<IPrescriptionAiService, PrescriptionAiService>();

// Swagger / OpenAPI Setup
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ensure SQL Server database and tables are created on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<LifeRelierDbContext>();
        dbContext.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating the SQL Server database.");
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();