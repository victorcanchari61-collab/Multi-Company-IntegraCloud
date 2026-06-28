using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface ICategoryRepository : IRepository<Category>
{
    Task<List<Category>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> ExistsByNameAsync(Guid companyId, string name, Guid? excludeId = null, CancellationToken ct = default);
}
