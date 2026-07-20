using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface ITransferRepository : IRepository<Transfer>
{
    Task<List<Transfer>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<List<Transfer>> GetByWarehouseAsync(Guid companyId, Guid warehouseId, CancellationToken ct = default);
    Task<Transfer?> GetWithItemsAsync(Guid id, CancellationToken ct = default);
}
