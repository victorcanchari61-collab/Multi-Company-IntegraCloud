using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IStockReservationRepository : IRepository<StockReservation>
{
    Task<List<StockReservation>> GetActiveByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default);
    Task<List<StockReservation>> GetActiveByProductAsync(Guid companyId, Guid productId, CancellationToken ct = default);
    Task<List<StockReservation>> GetByReferenceAsync(string referenceType, Guid referenceId, CancellationToken ct = default);
}
