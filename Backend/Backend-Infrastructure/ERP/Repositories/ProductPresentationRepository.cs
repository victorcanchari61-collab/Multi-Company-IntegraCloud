using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class ProductPresentationRepository(IamDbContext context)
    : BaseRepository<ProductPresentation>(context), IProductPresentationRepository
{
    public async Task<List<ProductPresentation>> GetByProductAsync(Guid productId, CancellationToken ct = default)
        => await Context.Set<ProductPresentation>()
            .Include(p => p.UnitOfMeasure)
            .Where(p => p.ProductId == productId)
            .OrderBy(p => p.SortOrder)
            .ToListAsync(ct);
}
