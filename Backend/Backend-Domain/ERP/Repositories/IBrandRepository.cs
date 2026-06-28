using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IBrandRepository : IRepository<Brand>
{
    Task<List<Brand>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> ExistsByNameAsync(Guid companyId, string name, Guid? excludeId = null, CancellationToken ct = default);
}
