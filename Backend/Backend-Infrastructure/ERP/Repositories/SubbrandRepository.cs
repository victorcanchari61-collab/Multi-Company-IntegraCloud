using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class SubbrandRepository(IamDbContext context)
    : BaseRepository<Subbrand>(context), ISubbrandRepository
{
    public async Task<List<Subbrand>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Subbrand>()
            .Include(s => s.Brand)
            .Where(s => s.CompanyId == companyId)
            .OrderBy(s => s.Brand.Name).ThenBy(s => s.Name)
            .ToListAsync(ct);

    public async Task<List<Subbrand>> GetByBrandAsync(Guid brandId, CancellationToken ct = default)
        => await Context.Set<Subbrand>()
            .Where(s => s.BrandId == brandId)
            .OrderBy(s => s.Name)
            .ToListAsync(ct);

    public async Task<bool> ExistsByNameAsync(Guid companyId, Guid brandId, string name, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<Subbrand>()
            .AnyAsync(s => s.CompanyId == companyId && s.BrandId == brandId && s.Name == name && (excludeId == null || s.Id != excludeId), ct);
}
