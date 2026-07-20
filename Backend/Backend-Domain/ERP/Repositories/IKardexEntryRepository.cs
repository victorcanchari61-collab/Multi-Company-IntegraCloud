using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IKardexEntryRepository : IRepository<KardexEntry>
{
    Task<List<KardexEntry>> GetByProductAsync(Guid companyId, Guid productId, CancellationToken ct = default);
    Task<List<KardexEntry>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default);
    Task<KardexEntry?> GetLastByProductAndWarehouseAsync(Guid companyId, Guid productId, Guid warehouseId, CancellationToken ct = default);
}
