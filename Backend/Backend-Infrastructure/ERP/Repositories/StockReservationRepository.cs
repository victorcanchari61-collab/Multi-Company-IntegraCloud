using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class StockReservationRepository(IamDbContext context)
    : BaseRepository<StockReservation>(context), IStockReservationRepository
{
    public async Task<List<StockReservation>> GetActiveByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default)
        => await Context.Set<StockReservation>()
            .Include(r => r.Product)
            .Where(r => r.CompanyId == companyId && r.WarehouseId == warehouseId && r.Status == "ACTIVE")
            .ToListAsync(ct);

    public async Task<List<StockReservation>> GetActiveByProductAsync(Guid companyId, Guid productId, CancellationToken ct = default)
        => await Context.Set<StockReservation>()
            .Include(r => r.Warehouse)
            .Where(r => r.CompanyId == companyId && r.ProductId == productId && r.Status == "ACTIVE")
            .ToListAsync(ct);

    public async Task<List<StockReservation>> GetByReferenceAsync(string referenceType, Guid referenceId, CancellationToken ct = default)
        => await Context.Set<StockReservation>()
            .Include(r => r.Product)
            .Include(r => r.Warehouse)
            .Where(r => r.ReferenceType == referenceType && r.ReferenceId == referenceId)
            .ToListAsync(ct);
}
