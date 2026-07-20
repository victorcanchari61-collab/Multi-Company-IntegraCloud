using Backend.Domain.ERP.Entities.Ventas;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories.Ventas;

public interface IQuotationRepository : IRepository<Quotation>
{
    Task<List<Quotation>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task<Quotation?> GetWithItemsAsync(Guid id, CancellationToken ct = default);
    Task<string> GetNextQuotationNumberAsync(Guid companyId, CancellationToken ct = default);
}
