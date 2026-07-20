using Backend.Domain.ERP.Entities.Ventas;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories.Ventas;

public interface ISalesPriceListRepository : IRepository<SalesPriceList>
{
    Task<List<SalesPriceList>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<SalesPriceList?> GetWithItemsAsync(Guid id, CancellationToken ct = default);
    Task<bool> ExistsByCodeAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken ct = default);
}
