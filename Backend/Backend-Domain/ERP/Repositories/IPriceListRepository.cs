using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IPriceListRepository : IRepository<PriceList>
{
    Task<List<PriceList>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
}
