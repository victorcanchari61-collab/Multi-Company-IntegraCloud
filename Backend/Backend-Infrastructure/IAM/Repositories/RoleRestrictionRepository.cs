using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class RoleRestrictionRepository(IamDbContext context) : IRoleRestrictionRepository
{
    public async Task<List<RoleRestriction>> GetByRoleIdsAsync(IEnumerable<Guid> roleIds, CancellationToken ct = default)
        => await context.RoleRestrictions
            .Where(r => roleIds.Contains(r.RoleId))
            .ToListAsync(ct);

    public async Task AddAsync(RoleRestriction restriction, CancellationToken ct = default)
        => await context.RoleRestrictions.AddAsync(restriction, ct);

    public void Delete(RoleRestriction restriction)
        => context.RoleRestrictions.Remove(restriction);
}
