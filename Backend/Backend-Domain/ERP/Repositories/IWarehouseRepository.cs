using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IWarehouseRepository : IRepository<Warehouse>
{
    Task<List<Warehouse>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> ExistsByCodeAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken ct = default);
}
