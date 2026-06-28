using Backend.Domain.IAM.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.IAM.Repositories;

public interface IRoleRepository : IRepository<Role>
{
    Task<List<Role>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default);
    Task<Role?> GetByIdWithPermissionsAsync(Guid roleId, CancellationToken ct = default);
}
