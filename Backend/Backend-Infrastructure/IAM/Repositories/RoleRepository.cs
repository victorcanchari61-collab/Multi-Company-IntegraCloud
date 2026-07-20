using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class RoleRepository(IamDbContext context)
    : BaseRepository<Role>(context), IRoleRepository
{
    public async Task<List<Role>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Roles
            .Include(r => r.RolePermissions)
            .Where(r => r.CompanyId == companyId)
            .ToListAsync(ct);

    public async Task<List<Role>> GetByCompanyIdWithRestrictionsAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Roles
            .Include(r => r.Restrictions)
            .Where(r => r.CompanyId == companyId)
            .ToListAsync(ct);

    public async Task<Role?> GetByIdWithPermissionsAsync(Guid roleId, CancellationToken ct = default)
        => await Context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == roleId, ct);

    public async Task<Role?> GetByIdWithRestrictionsAsync(Guid roleId, CancellationToken ct = default)
        => await Context.Roles
            .Include(r => r.Restrictions)
            .FirstOrDefaultAsync(r => r.Id == roleId, ct);

    public async Task<List<string>> GetRestrictionKeysByRoleIdsAsync(IReadOnlyCollection<Guid> roleIds, CancellationToken ct = default)
        => await Context.Set<RoleRestriction>()
            .Where(r => roleIds.Contains(r.RoleId))
            .Select(r => r.RestrictedKey)
            .Distinct()
            .ToListAsync(ct);

    public async Task<List<Role>> GetByCompanyIdWithHierarchyAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Roles
            .Include(r => r.ChildRoles)
            .Where(r => r.CompanyId == companyId)
            .OrderBy(r => r.SortOrder)
            .ThenBy(r => r.Name)
            .ToListAsync(ct);

    public async Task<Role?> GetByIdWithParentAsync(Guid roleId, CancellationToken ct = default)
        => await Context.Roles
            .Include(r => r.ParentRole)
            .FirstOrDefaultAsync(r => r.Id == roleId, ct);
}
