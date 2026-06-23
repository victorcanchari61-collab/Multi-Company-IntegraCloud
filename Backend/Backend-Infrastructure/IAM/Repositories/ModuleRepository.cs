using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class ModuleRepository(IamDbContext context)
    : BaseRepository<Module>(context), IModuleRepository
{
    public async Task<List<Module>> GetBySystemIdAsync(Guid systemId, CancellationToken ct = default)
        => await Context.Modules.Where(m => m.SystemId == systemId).ToListAsync(ct);
}
