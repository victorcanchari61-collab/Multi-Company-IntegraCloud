using Backend.Domain.ERP.Entities.Compras;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories.Compras;

public interface ISupplierEvaluationRepository : IRepository<SupplierEvaluation>
{
    Task<List<SupplierEvaluation>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<List<SupplierEvaluation>> GetBySupplierAsync(Guid supplierId, CancellationToken ct = default);
}
