using Backend.Domain.ERP.Entities.Ventas;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories.Ventas;

public interface ISalesCommissionRepository : IRepository<SalesCommission>
{
    Task<List<SalesCommission>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> ExistsByCodeAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken ct = default);
}
