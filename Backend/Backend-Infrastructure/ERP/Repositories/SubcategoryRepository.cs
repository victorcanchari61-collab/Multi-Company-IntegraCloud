using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class SubcategoryRepository(IamDbContext context)
    : BaseRepository<Subcategory>(context), ISubcategoryRepository
{
    public async Task<List<Subcategory>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Subcategory>()
            .Include(s => s.Category)
            .Where(s => s.CompanyId == companyId)
            .OrderBy(s => s.Category.Name).ThenBy(s => s.Name)
            .ToListAsync(ct);

    public async Task<List<Subcategory>> GetByCategoryAsync(Guid categoryId, CancellationToken ct = default)
        => await Context.Set<Subcategory>()
            .Where(s => s.CategoryId == categoryId)
            .OrderBy(s => s.Name)
            .ToListAsync(ct);

    public async Task<bool> ExistsByNameAsync(Guid companyId, Guid categoryId, string name, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<Subcategory>()
            .AnyAsync(s => s.CompanyId == companyId && s.CategoryId == categoryId && s.Name == name && (excludeId == null || s.Id != excludeId), ct);
}
