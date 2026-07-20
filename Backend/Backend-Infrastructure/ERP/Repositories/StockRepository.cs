using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class StockRepository(IamDbContext context)
    : BaseRepository<Stock>(context), IStockRepository
{
    public async Task<Stock?> GetByProductAndWarehouseAsync(Guid companyId, Guid productId, Guid warehouseId, CancellationToken ct = default)
        => await Context.Set<Stock>()
            .FirstOrDefaultAsync(s => s.CompanyId == companyId && s.ProductId == productId && s.WarehouseId == warehouseId, ct);

    public async Task<List<Stock>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default)
        => await Context.Set<Stock>()
            .Include(s => s.Product)
            .Where(s => s.CompanyId == companyId && s.WarehouseId == warehouseId)
            .OrderBy(s => s.Product!.Name)
            .ToListAsync(ct);

    public async Task<List<Stock>> GetByProductAsync(Guid companyId, Guid productId, CancellationToken ct = default)
        => await Context.Set<Stock>()
            .Include(s => s.Warehouse)
            .Where(s => s.CompanyId == companyId && s.ProductId == productId)
            .ToListAsync(ct);

    public async Task<List<Stock>> GetAllByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Stock>()
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => s.CompanyId == companyId)
            .OrderBy(s => s.Warehouse!.Name)
            .ThenBy(s => s.Product!.Name)
            .ToListAsync(ct);

    public async Task<List<Stock>> GetLowStockAsync(Guid companyId, decimal threshold, CancellationToken ct = default)
        => await Context.Set<Stock>()
            .Include(s => s.Product)
            .Include(s => s.Warehouse)
            .Where(s => s.CompanyId == companyId && s.Quantity <= threshold)
            .OrderBy(s => s.Quantity)
            .ToListAsync(ct);
}
