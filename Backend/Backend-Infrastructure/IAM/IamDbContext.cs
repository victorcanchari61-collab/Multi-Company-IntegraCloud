using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Entities.Compras;
using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Interfaces;
using Backend.Infrastructure.IAM.Configurations;
using Backend.SharedKernel;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM;

public sealed class IamDbContext : DbContext, IUnitOfWork
{
    public DbSet<SystemEntity> Systems => Set<SystemEntity>();
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<View> Views => Set<View>();
    public DbSet<Component> Components => Set<Component>();
    public DbSet<PermissionAction> Actions => Set<PermissionAction>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanyModuleAccess> CompanyModuleAccesses => Set<CompanyModuleAccess>();
    public DbSet<CompanySystemAccess> CompanySystemAccesses => Set<CompanySystemAccess>();
    public DbSet<CompanyBillingCredential> CompanyBillingCredentials => Set<CompanyBillingCredential>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RoleRestriction> RoleRestrictions => Set<RoleRestriction>();
    public DbSet<UserRestriction> UserRestrictions => Set<UserRestriction>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AuthorizationConfig> AuthorizationConfigs => Set<AuthorizationConfig>();
    public DbSet<AuthorizationRequest> AuthorizationRequests => Set<AuthorizationRequest>();
    public DbSet<AuthorizationGrant> AuthorizationGrants => Set<AuthorizationGrant>();
    public DbSet<Notification> Notifications => Set<Notification>();

    // ── ERP / Maestros ──
    public DbSet<UnitOfMeasure> UnitsOfMeasure => Set<UnitOfMeasure>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Subcategory> Subcategories => Set<Subcategory>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Subbrand> Subbrands => Set<Subbrand>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductPresentation> ProductPresentations => Set<ProductPresentation>();
    public DbSet<PriceList> PriceLists => Set<PriceList>();
    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<ProductPrice> ProductPrices => Set<ProductPrice>();
    public DbSet<ProductLot> ProductLots => Set<ProductLot>();

    // ── ERP / Inventario ──
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Stock> Stock => Set<Stock>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<KardexEntry> KardexEntries => Set<KardexEntry>();
    public DbSet<Transfer> Transfers => Set<Transfer>();
    public DbSet<TransferItem> TransferItems => Set<TransferItem>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<StockReservation> StockReservations => Set<StockReservation>();
    public DbSet<SerialNumber> SerialNumbers => Set<SerialNumber>();
    public DbSet<PhysicalCount> PhysicalCounts => Set<PhysicalCount>();
    public DbSet<PhysicalCountLine> PhysicalCountLines => Set<PhysicalCountLine>();

    // ── ERP / Compras ──
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    public DbSet<PurchaseRequest> PurchaseRequests => Set<PurchaseRequest>();
    public DbSet<PurchaseRequestItem> PurchaseRequestItems => Set<PurchaseRequestItem>();
    public DbSet<SupplierEvaluation> SupplierEvaluations => Set<SupplierEvaluation>();
    public DbSet<PurchaseContract> PurchaseContracts => Set<PurchaseContract>();

    // ── ERP / Ventas ──
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<SalesPriceList> SalesPriceLists => Set<SalesPriceList>();
    public DbSet<SalesPriceListItem> SalesPriceListItems => Set<SalesPriceListItem>();
    public DbSet<CommercialTerm> CommercialTerms => Set<CommercialTerm>();
    public DbSet<SalesCommission> SalesCommissions => Set<SalesCommission>();
    public DbSet<Quotation> Quotations => Set<Quotation>();
    public DbSet<QuotationItem> QuotationItems => Set<QuotationItem>();
    public DbSet<SalesOrder> SalesOrders => Set<SalesOrder>();
    public DbSet<SalesOrderItem> SalesOrderItems => Set<SalesOrderItem>();

    public IamDbContext(DbContextOptions<IamDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Ignore<DomainEvent>();

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IamDbContext).Assembly);

        modelBuilder.Entity<User>().HasQueryFilter(u => u.CompanyId != null || u.IsOwner);
        modelBuilder.Entity<Role>().HasQueryFilter(r => r.Company != null);
        modelBuilder.Entity<CompanyModuleAccess>().HasQueryFilter(c => c.Company != null);
    }
}
