using System.Text;
using Backend.Application.IAM;
using Backend.Domain.IAM.Services;
using Backend.Infrastructure.ERP.Hubs;
using Backend.Infrastructure.IAM.Hubs;
using Backend.Infrastructure.ERP.Services;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Services;
using Backend_API.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        };

        // Permitir token JWT vía query string para SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken))
                    context.Token = accessToken;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

QuestPDF.Settings.License = LicenseType.Community;

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<TenantContext>();

builder.Services.AddIamInfrastructure(builder.Configuration);
builder.Services.AddIamApplication();

// ── SignalR + Redis Pub/Sub ──
builder.Services.AddSignalR();
builder.Services.AddHostedService<StockEventDispatcher>();

// Proxy de consulta RUC/DNI (apisperu): el token vive aquí, no en el cliente.
builder.Services.AddHttpClient<IDocumentLookupService, ApisPeruDocumentLookupService>((sp, client) =>
{
    var url = sp.GetRequiredService<IConfiguration>()["ApisPeru:Url"]
        ?? throw new InvalidOperationException("ApisPeru:Url not configured.");
    client.BaseAddress = new Uri(url.TrimEnd('/') + "/");
});

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<TenantContextMiddleware>();
app.MapControllers();
app.MapHub<StockHub>(StockHub.Endpoint);
app.MapHub<NotificationHub>(NotificationHub.Endpoint);

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var db = services.GetRequiredService<IamDbContext>();
    await db.Database.MigrateAsync();

    var logger = services.GetRequiredService<ILogger<Program>>();
    var passwordHasher = services.GetRequiredService<IPasswordHasher>();
    await IamSeedService.SeedAsync(db, passwordHasher, logger);
}

app.Run();
