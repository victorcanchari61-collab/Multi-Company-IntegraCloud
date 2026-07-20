using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class KardexEntryRepository(IamDbContext context)
    : BaseRepository<KardexEntry>(context), IKardexEntryRepository
{
    public async Task<List<KardexEntry>> GetByProductAsync(Guid companyId, Guid productId, CancellationToken ct = default)
        => await Context.Set<KardexEntry>()
            .Include(k => k.Warehouse)
            .Where(k => k.CompanyId == companyId && k.ProductId == productId)
            .OrderByDescending(k => k.CreatedAt)
            .ToListAsync(ct);

    public async Task<List<KardexEntry>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default)
        => await Context.Set<KardexEntry>()
            .Include(k => k.Product)
            .Where(k => k.CompanyId == companyId && k.WarehouseId == warehouseId)
            .OrderByDescending(k => k.CreatedAt)
            .ToListAsync(ct);

    public async Task<KardexEntry?> GetLastByProductAndWarehouseAsync(Guid companyId, Guid productId, Guid warehouseId, CancellationToken ct = default)
        => await Context.Set<KardexEntry>()
            .Where(k => k.CompanyId == companyId && k.ProductId == productId && k.WarehouseId == warehouseId)
            .OrderByDescending(k => k.CreatedAt)
            .FirstOrDefaultAsync(ct);
}
