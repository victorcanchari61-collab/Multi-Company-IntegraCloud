using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class StockMovementRepository(IamDbContext context)
    : BaseRepository<StockMovement>(context), IStockMovementRepository
{
    public async Task<List<StockMovement>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default)
        => await Context.Set<StockMovement>()
            .Include(m => m.Product)
            .Where(m => m.CompanyId == companyId && m.WarehouseId == warehouseId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(ct);

    public async Task<List<StockMovement>> GetByProductAsync(Guid companyId, Guid productId, CancellationToken ct = default)
        => await Context.Set<StockMovement>()
            .Include(m => m.Warehouse)
            .Where(m => m.CompanyId == companyId && m.ProductId == productId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(ct);

    public async Task<List<StockMovement>> GetByDateRangeAsync(Guid companyId, DateTime from, DateTime to, CancellationToken ct = default)
        => await Context.Set<StockMovement>()
            .Include(m => m.Product)
            .Include(m => m.Warehouse)
            .Where(m => m.CompanyId == companyId && m.CreatedAt >= from && m.CreatedAt <= to)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(ct);
}
