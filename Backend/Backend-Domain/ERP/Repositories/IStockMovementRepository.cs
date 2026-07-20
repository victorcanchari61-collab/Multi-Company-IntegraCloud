using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IStockMovementRepository : IRepository<StockMovement>
{
    Task<List<StockMovement>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default);
    Task<List<StockMovement>> GetByProductAsync(Guid companyId, Guid productId, CancellationToken ct = default);
    Task<List<StockMovement>> GetByDateRangeAsync(Guid companyId, DateTime from, DateTime to, CancellationToken ct = default);
}
