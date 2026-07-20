using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface ILocationRepository : IRepository<Location>
{
    Task<List<Location>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default);
    Task<List<Location>> GetTreeAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default);
}
