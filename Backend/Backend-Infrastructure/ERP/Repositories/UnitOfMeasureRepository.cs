using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class UnitOfMeasureRepository(IamDbContext context)
    : BaseRepository<UnitOfMeasure>(context), IUnitOfMeasureRepository
{
    public async Task<List<UnitOfMeasure>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<UnitOfMeasure>()
            .Where(u => u.CompanyId == companyId)
            .OrderBy(u => u.Name)
            .ToListAsync(ct);

    public async Task<bool> ExistsByNameAsync(Guid companyId, string name, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<UnitOfMeasure>()
            .AnyAsync(u => u.CompanyId == companyId && u.Name == name && (excludeId == null || u.Id != excludeId), ct);
}
