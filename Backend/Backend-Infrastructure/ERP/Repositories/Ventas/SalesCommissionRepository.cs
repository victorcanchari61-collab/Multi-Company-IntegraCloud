using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories.Ventas;

internal sealed class SalesCommissionRepository(IamDbContext context)
    : BaseRepository<SalesCommission>(context), ISalesCommissionRepository
{
    public async Task<List<SalesCommission>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<SalesCommission>()
            .Where(sc => sc.CompanyId == companyId)
            .OrderBy(sc => sc.Name)
            .ToListAsync(ct);

    public async Task<bool> ExistsByCodeAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<SalesCommission>()
            .AnyAsync(sc => sc.CompanyId == companyId && sc.Code == code && (excludeId == null || sc.Id != excludeId), ct);
}
