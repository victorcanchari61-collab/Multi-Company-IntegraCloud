using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IProductPriceRepository : IRepository<ProductPrice>
{
    Task<List<ProductPrice>> GetByProductAsync(Guid productId, CancellationToken ct = default);
    Task<ProductPrice?> GetByKeyAsync(Guid productId, Guid presentationId, Guid priceListId, Guid currencyId, CancellationToken ct = default);
}
