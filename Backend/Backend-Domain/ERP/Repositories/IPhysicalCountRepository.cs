using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IPhysicalCountRepository : IRepository<PhysicalCount>
{
    Task<List<PhysicalCount>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default);
    Task<PhysicalCount?> GetWithLinesAsync(Guid id, CancellationToken ct = default);
}
