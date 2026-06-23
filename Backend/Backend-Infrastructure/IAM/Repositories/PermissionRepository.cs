using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class PermissionRepository(IamDbContext context)
    : BaseRepository<Permission>(context), IPermissionRepository
{
    public async Task<List<Permission>> GetByModuleIdAsync(Guid moduleId, CancellationToken ct = default)
        => await Context.Permissions.Where(p => p.ModuleId == moduleId).ToListAsync(ct);
}
