using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class BrandRepository(IamDbContext context)
    : BaseRepository<Brand>(context), IBrandRepository
{
    public async Task<List<Brand>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Brand>()
            .Where(b => b.CompanyId == companyId)
            .OrderBy(b => b.Name)
            .ToListAsync(ct);

    public async Task<bool> ExistsByNameAsync(Guid companyId, string name, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<Brand>()
            .AnyAsync(b => b.CompanyId == companyId && b.Name == name && (excludeId == null || b.Id != excludeId), ct);
}
