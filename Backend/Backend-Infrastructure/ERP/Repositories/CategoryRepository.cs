using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class CategoryRepository(IamDbContext context)
    : BaseRepository<Category>(context), ICategoryRepository
{
    public async Task<List<Category>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Category>()
            .Where(c => c.CompanyId == companyId)
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

    public async Task<bool> ExistsByNameAsync(Guid companyId, string name, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<Category>()
            .AnyAsync(c => c.CompanyId == companyId && c.Name == name && (excludeId == null || c.Id != excludeId), ct);
}
