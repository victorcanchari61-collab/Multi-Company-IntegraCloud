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

    public async Task<Role?> GetByIdWithPermissionsAsync(Guid roleId, CancellationToken ct = default)
        => await Context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == roleId, ct);
}
