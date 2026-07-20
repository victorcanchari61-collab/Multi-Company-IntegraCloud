using Backend.Domain.ERP.Repositories;
using Backend.Domain.ERP.Services;
using Backend.Domain.IAM.Interfaces;
using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;
using Backend.Infrastructure.ERP.Repositories;
using Backend.Infrastructure.ERP.Services;
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
        // ── ERP / Inventario ──
        services.AddScoped<IWarehouseRepository, WarehouseRepository>();
        services.AddScoped<IStockRepository, StockRepository>();
        services.AddScoped<IStockMovementRepository, StockMovementRepository>();
        services.AddScoped<ITransferRepository, TransferRepository>();
        services.AddScoped<IKardexEntryRepository, KardexEntryRepository>();
        services.AddSingleton<IRedisStockCache, RedisStockCache>();
        services.AddSingleton<IStockLockService, StockLockService>();
        services.AddScoped<ILocationRepository, LocationRepository>();
        services.AddScoped<IStockReservationRepository, StockReservationRepository>();
        services.AddScoped<ISerialNumberRepository, SerialNumberRepository>();
        services.AddScoped<IPhysicalCountRepository, PhysicalCountRepository>();

        // ── ERP / Compras ──
        services.AddScoped<Backend.Domain.ERP.Repositories.Compras.ISupplierRepository,
            Backend.Infrastructure.ERP.Repositories.Compras.SupplierRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.Compras.IPurchaseOrderRepository,
            Backend.Infrastructure.ERP.Repositories.Compras.PurchaseOrderRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.Compras.IPurchaseRequestRepository,
            Backend.Infrastructure.ERP.Repositories.Compras.PurchaseRequestRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.Compras.ISupplierEvaluationRepository,
            Backend.Infrastructure.ERP.Repositories.Compras.SupplierEvaluationRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.Compras.IPurchaseContractRepository,
            Backend.Infrastructure.ERP.Repositories.Compras.PurchaseContractRepository>();

        // ── ERP / Ventas ──
        services.AddScoped<Backend.Domain.ERP.Repositories.Ventas.ICustomerRepository,
            Backend.Infrastructure.ERP.Repositories.Ventas.CustomerRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.Ventas.ISalesPriceListRepository,
            Backend.Infrastructure.ERP.Repositories.Ventas.SalesPriceListRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.Ventas.ICommercialTermRepository,
            Backend.Infrastructure.ERP.Repositories.Ventas.CommercialTermRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.Ventas.ISalesCommissionRepository,
            Backend.Infrastructure.ERP.Repositories.Ventas.SalesCommissionRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.Ventas.IQuotationRepository,
            Backend.Infrastructure.ERP.Repositories.Ventas.QuotationRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.Ventas.ISalesOrderRepository,
            Backend.Infrastructure.ERP.Repositories.Ventas.SalesOrderRepository>();

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
        services.AddScoped<Backend.Domain.ERP.Repositories.IProductPresentationRepository,
            Backend.Infrastructure.ERP.Repositories.ProductPresentationRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.IPriceListRepository,
            Backend.Infrastructure.ERP.Repositories.PriceListRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.ICurrencyRepository,
            Backend.Infrastructure.ERP.Repositories.CurrencyRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.IProductPriceRepository,
            Backend.Infrastructure.ERP.Repositories.ProductPriceRepository>();
        services.AddScoped<Backend.Domain.ERP.Repositories.IProductLotRepository,
            Backend.Infrastructure.ERP.Repositories.ProductLotRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IUserRestrictionRepository, UserRestrictionRepository>();
        services.AddScoped<IRoleRestrictionRepository, RoleRestrictionRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        services.AddScoped<IAuthorizationConfigRepository, AuthorizationConfigRepository>();
        services.AddScoped<IAuthorizationRequestRepository, AuthorizationRequestRepository>();
        services.AddScoped<IAuthorizationGrantRepository, AuthorizationGrantRepository>();
        services.AddScoped<IAuthorizationService, AuthorizationService>();
        services.AddScoped<IEffectiveAccessService, EffectiveAccessService>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<INotificationService, NotificationService>();

        services.AddDataProtection();
        services.AddScoped<ISecretProtector, DataProtectionSecretProtector>();

        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddSingleton<IPermissionCache, RedisPermissionCache>();

        // ── PDF ──
        services.AddScoped<Backend.SharedKernel.Services.IPdfService,
            Backend.Infrastructure.ERP.Services.QuestPdfService>();

        return services;
    }
}
