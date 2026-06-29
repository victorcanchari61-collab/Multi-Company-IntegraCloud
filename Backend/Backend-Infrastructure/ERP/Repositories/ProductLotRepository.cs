using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class ProductLotRepository(IamDbContext context)
    : BaseRepository<ProductLot>(context), IProductLotRepository
{
    public async Task<List<ProductLot>> GetByProductAsync(Guid productId, CancellationToken ct = default)
        => await Context.Set<ProductLot>()
            .Where(l => l.ProductId == productId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(ct);
}
