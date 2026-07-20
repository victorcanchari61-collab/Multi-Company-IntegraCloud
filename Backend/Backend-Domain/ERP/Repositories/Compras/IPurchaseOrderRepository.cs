using Backend.Domain.ERP.Entities.Compras;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories.Compras;

public interface IPurchaseOrderRepository : IRepository<PurchaseOrder>
{
    Task<List<PurchaseOrder>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<PurchaseOrder?> GetWithItemsAsync(Guid id, CancellationToken ct = default);
    Task<string> GetNextOrderNumberAsync(Guid companyId, CancellationToken ct = default);
}
