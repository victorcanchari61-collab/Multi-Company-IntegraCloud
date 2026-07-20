using Backend.Domain.ERP.Entities.Compras;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories.Compras;

public interface IPurchaseContractRepository : IRepository<PurchaseContract>
{
    Task<List<PurchaseContract>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<List<PurchaseContract>> GetBySupplierAsync(Guid supplierId, CancellationToken ct = default);
}
