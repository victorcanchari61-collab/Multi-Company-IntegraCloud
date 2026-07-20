using Backend.Domain.ERP.Entities.Compras;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories.Compras;

public interface IPurchaseRequestRepository : IRepository<PurchaseRequest>
{
    Task<List<PurchaseRequest>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<PurchaseRequest?> GetWithSupplierAsync(Guid id, CancellationToken ct = default);
    Task<string> GetNextRequestNumberAsync(Guid companyId, CancellationToken ct = default);
}
