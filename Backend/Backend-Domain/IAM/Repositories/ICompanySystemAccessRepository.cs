using Backend.Domain.IAM.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.IAM.Repositories;

public interface ICompanySystemAccessRepository : IRepository<CompanySystemAccess>
{
    Task<List<CompanySystemAccess>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> HasAccessAsync(Guid companyId, Guid systemId, CancellationToken ct = default);
    Task<CompanySystemAccess?> GetByCompanyAndSystemAsync(Guid companyId, Guid systemId, CancellationToken ct = default);
}
