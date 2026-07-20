using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface ISubcategoryRepository : IRepository<Subcategory>
{
    Task<List<Subcategory>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<List<Subcategory>> GetByCategoryAsync(Guid categoryId, CancellationToken ct = default);
    Task<bool> ExistsByNameAsync(Guid companyId, Guid categoryId, string name, Guid? excludeId = null, CancellationToken ct = default);
}
