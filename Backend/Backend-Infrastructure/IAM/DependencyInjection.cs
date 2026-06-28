using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;
using Backend.Infrastructure.IAM.Repositories;
using Backend.Infrastructure.IAM.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace Backend.Infrastructure.IAM;

public static class DependencyInjection
{
    public static IServiceCollection AddIamInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var pgConnection = config.GetConnectionString("PostgreSQL")
            ?? throw new InvalidOperationException("PostgreSQL connection string not configured.");

        var redisConnection = config.GetConnectionString("Redis")
            ?? throw new InvalidOperationException("Redis connection string not configured.");

        services.AddDbContext<IamDbContext>(options =>
            options.UseNpgsql(pgConnection, npgsql =>
                npgsql.MigrationsAssembly(typeof(IamDbContext).Assembly.FullName)));

        // El DbContext actúa como Unit of Work para el pipeline de comandos.
        services.AddScoped<Backend.SharedKernel.IUnitOfWork>(
            sp => sp.GetRequiredService<IamDbContext>());

        services.AddSingleton<IConnectionMultiplexer>(
            ConnectionMultiplexer.Connect(new ConfigurationOptions
            {
                EndPoints = { redisConnection },
                AbortOnConnectFail = false,
            }));

        services.AddScoped<ISystemRepository, SystemRepository>();
        services.AddScoped<IModuleRepository, ModuleRepository>();
        services.AddScoped<IViewRepository, ViewRepository>();
        services.AddScoped<IComponentRepository, ComponentRepository>();
        services.AddScoped<IActionRepository, ActionRepository>();
        services.AddScoped<IPermissionRepository, PermissionRepository>();
        services.AddScoped<ICompanyRepository, CompanyRepository>();
        services.AddScoped<ICompanyModuleAccessRepository, CompanyModuleAccessRepository>();
        services.AddScoped<ICompanySystemAccessRepository, CompanySystemAccessRepository>();
        services.AddScoped<ICompanyBillingCredentialRepository, CompanyBillingCredentialRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.IUnitOfMeasureRepository,
            Backend.Infrastructure.ERP.Repositories.UnitOfMeasureRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.ICategoryRepository,
            Backend.Infrastructure.ERP.Repositories.CategoryRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.ISubcategoryRepository,
            Backend.Infrastructure.ERP.Repositories.SubcategoryRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.IBrandRepository,
            Backend.Infrastructure.ERP.Repositories.BrandRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.ISubbrandRepository,
            Backend.Infrastructure.ERP.Repositories.SubbrandRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.IProductRepository,
            Backend.Infrastructure.ERP.Repositories.ProductRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        services.AddDataProtection();
        services.AddScoped<ISecretProtector, DataProtectionSecretProtector>();

        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddSingleton<IPermissionCache, RedisPermissionCache>();

        return services;
    }
}
