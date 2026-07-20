using Backend.Domain.IAM.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.IAM.Repositories;

public interface IRoleRepository : IRepository<Role>
{
    Task<List<Role>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default);
    Task<List<Role>> GetByCompanyIdWithRestrictionsAsync(Guid companyId, CancellationToken ct = default);
    Task<Role?> GetByIdWithPermissionsAsync(Guid roleId, CancellationToken ct = default);
    Task<Role?> GetByIdWithRestrictionsAsync(Guid roleId, CancellationToken ct = default);
    Task<List<string>> GetRestrictionKeysByRoleIdsAsync(IReadOnlyCollection<Guid> roleIds, CancellationToken ct = default);
    Task<List<Role>> GetByCompanyIdWithHierarchyAsync(Guid companyId, CancellationToken ct = default);
    Task<Role?> GetByIdWithParentAsync(Guid roleId, CancellationToken ct = default);
}
