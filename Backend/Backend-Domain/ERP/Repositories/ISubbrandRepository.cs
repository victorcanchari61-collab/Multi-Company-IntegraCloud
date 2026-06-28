using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface ISubbrandRepository : IRepository<Subbrand>
{
    Task<List<Subbrand>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<List<Subbrand>> GetByBrandAsync(Guid brandId, CancellationToken ct = default);
    Task<bool> ExistsByNameAsync(Guid companyId, Guid brandId, string name, Guid? excludeId = null, CancellationToken ct = default);
}
