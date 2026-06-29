using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Infrastructure.IAM;
using Backend.Infrastructure.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.ERP.Repositories;

internal sealed class ProductPriceRepository(IamDbContext context)
    : BaseRepository<ProductPrice>(context), IProductPriceRepository
{
    public async Task<List<ProductPrice>> GetByProductAsync(Guid productId, CancellationToken ct = default)
        => await Context.Set<ProductPrice>()
            .Include(p => p.Presentation)
            .Include(p => p.PriceList)
            .Include(p => p.Currency)
            .Where(p => p.ProductId == productId)
            .ToListAsync(ct);

    public async Task<ProductPrice?> GetByKeyAsync(
        Guid productId, Guid presentationId, Guid priceListId, Guid currencyId, CancellationToken ct = default)
        => await Context.Set<ProductPrice>()
            .FirstOrDefaultAsync(p =>
                p.ProductId == productId &&
                p.PresentationId == presentationId &&
                p.PriceListId == priceListId &&
                p.CurrencyId == currencyId, ct);
}
