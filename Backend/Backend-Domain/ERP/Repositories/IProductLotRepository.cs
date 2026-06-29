using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IProductLotRepository : IRepository<ProductLot>
{
    Task<List<ProductLot>> GetByProductAsync(Guid productId, CancellationToken ct = default);
}
