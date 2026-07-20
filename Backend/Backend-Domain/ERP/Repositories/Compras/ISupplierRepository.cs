using Backend.Domain.ERP.Entities.Compras;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories.Compras;

public interface ISupplierRepository : IRepository<Supplier>
{
    Task<List<Supplier>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> ExistsByCodeAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken ct = default);
}
