using Backend.Domain.ERP.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.ERP.Repositories;

public interface IProductPresentationRepository : IRepository<ProductPresentation>
{
    Task<List<ProductPresentation>> GetByProductAsync(Guid productId, CancellationToken ct = default);
}
