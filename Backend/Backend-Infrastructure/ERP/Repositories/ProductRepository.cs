using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class ProductRepository(IamDbContext context)
    : BaseRepository<Product>(context), IProductRepository
{
    public async Task<List<Product>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Set<Product>()
            .Include(p => p.Category)
            .Include(p => p.Subcategory)
            .Include(p => p.Brand)
            .Include(p => p.Subbrand)
            .Include(p => p.UnitOfMeasure)
            .Where(p => p.CompanyId == companyId)
            .OrderBy(p => p.Name)
            .ToListAsync(ct);

    public async Task<bool> ExistsBySkuAsync(Guid companyId, string sku, Guid? excludeId = null, CancellationToken ct = default)
        => await Context.Set<Product>()
            .AnyAsync(p => p.CompanyId == companyId && p.Sku == sku && (excludeId == null || p.Id != excludeId), ct);
}
