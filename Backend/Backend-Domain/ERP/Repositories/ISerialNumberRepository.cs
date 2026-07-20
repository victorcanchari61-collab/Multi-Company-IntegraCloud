using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface ISerialNumberRepository : IRepository<SerialNumber>
{
    Task<List<SerialNumber>> GetByProductAsync(Guid companyId, Guid productId, CancellationToken ct = default);
    Task<List<SerialNumber>> GetByBatchAsync(Guid batchId, CancellationToken ct = default);
    Task<SerialNumber?> GetBySerialAsync(Guid companyId, string serial, CancellationToken ct = default);
    Task<List<SerialNumber>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default);
}
