using Backend.Domain.ERP.Entities.Ventas;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories.Ventas;

public interface ISalesOrderRepository : IRepository<SalesOrder>
{
    Task<List<SalesOrder>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<SalesOrder?> GetWithItemsAsync(Guid id, CancellationToken ct = default);
    Task<string> GetNextOrderNumberAsync(Guid companyId, CancellationToken ct = default);
}
