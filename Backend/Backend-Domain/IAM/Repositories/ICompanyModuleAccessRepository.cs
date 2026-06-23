using Backend.Domain.IAM.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.IAM.Repositories;

public interface ICompanyModuleAccessRepository : IRepository<CompanyModuleAccess>
{
    Task<List<CompanyModuleAccess>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> HasAccessAsync(Guid companyId, Guid moduleId, CancellationToken ct = default);
}
