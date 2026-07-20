using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class WarehouseRepository(IamDbContext context)
    : BaseRepository<Warehouse>(context), IWarehouseRepository
{
    public async Task<List<Warehouse>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Warehouse>()
            .Where(w => w.CompanyId == companyId)
            .OrderBy(w => w.Name)
            .ToListAsync(ct);

    public async Task<bool> ExistsByCodeAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<Warehouse>()
            .AnyAsync(w => w.CompanyId == companyId && w.Code == code && (excludeId == null || w.Id != excludeId), ct);
}
