using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface ICurrencyRepository : IRepository<Currency>
{
    Task<List<Currency>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
}
