using Backend.Domain.IAM.Entities;

namespace Backend.Domain.IAM.Repositories;

public interface IRoleRestrictionRepository
{
    Task<List<RoleRestriction>> GetByRoleIdsAsync(IEnumerable<Guid> roleIds, CancellationToken ct = default);
    Task AddAsync(RoleRestriction restriction, CancellationToken ct = default);
    void Delete(RoleRestriction restriction);
}
