using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IProductRepository : IRepository<Product>
{
    Task<List<Product>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> ExistsBySkuAsync(Guid companyId, string sku, Guid? excludeId = null, CancellationToken ct = default);
}
