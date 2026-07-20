using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class PhysicalCountRepository(IamDbContext context)
    : BaseRepository<PhysicalCount>(context), IPhysicalCountRepository
{
    public async Task<List<PhysicalCount>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default)
        => await Context.Set<PhysicalCount>()
            .Include(p => p.Warehouse)
            .Where(p => p.CompanyId == companyId && p.WarehouseId == warehouseId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

    public async Task<PhysicalCount?> GetWithLinesAsync(Guid id, CancellationToken ct = default)
        => await Context.Set<PhysicalCount>()
            .Include(p => p.Warehouse)
            .Include(p => p.Lines).ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
}
