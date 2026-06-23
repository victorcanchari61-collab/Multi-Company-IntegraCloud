using Backend.Domain.IAM.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.IAM.Repositories;

public interface ICompanyRepository : IRepository<Company>
{
    Task<Company?> GetByTaxIdAsync(string taxId, CancellationToken ct = default);
    Task<Company?> GetBySlugAsync(string slug, CancellationToken ct = default);
}
