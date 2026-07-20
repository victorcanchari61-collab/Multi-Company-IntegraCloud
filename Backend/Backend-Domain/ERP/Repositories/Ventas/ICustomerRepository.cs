using Backend.Domain.ERP.Entities.Ventas;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories.Ventas;

public interface ICustomerRepository : IRepository<Customer>
{
    Task<List<Customer>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> ExistsByCodeAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken ct = default);
}
