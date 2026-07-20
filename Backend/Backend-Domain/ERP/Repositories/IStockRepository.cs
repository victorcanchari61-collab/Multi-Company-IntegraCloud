using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IStockRepository : IRepository<Stock>
{
    Task<Stock?> GetByProductAndWarehouseAsync(Guid companyId, Guid productId, Guid warehouseId, CancellationToken ct = default);
    Task<List<Stock>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default);
    Task<List<Stock>> GetByProductAsync(Guid companyId, Guid productId, CancellationToken ct = default);
    Task<List<Stock>> GetAllByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<List<Stock>> GetLowStockAsync(Guid companyId, decimal threshold, CancellationToken ct = default);
}
