using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class LocationRepository(IamDbContext context)
    : BaseRepository<Location>(context), ILocationRepository
{
    public async Task<List<Location>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default)
        => await Context.Set<Location>()
            .Where(l => l.CompanyId == companyId && l.WarehouseId == warehouseId)
            .OrderBy(l => l.Zone).ThenBy(l => l.Code)
            .ToListAsync(ct);

    public async Task<List<Location>> GetTreeAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default)
        => await Context.Set<Location>()
            .Include(l => l.Parent)
            .Where(l => l.CompanyId == companyId && l.WarehouseId == warehouseId)
            .OrderBy(l => l.Zone).ThenBy(l => l.Code)
            .ToListAsync(ct);
}
