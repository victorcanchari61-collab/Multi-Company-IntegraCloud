using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal sealed class SystemRepository(IamDbContext context)
    : BaseRepository<SystemEntity>(context), ISystemRepository
{
    public async Task<SystemEntity?> GetByCodeAsync(string code, CancellationToken ct = default)
        => await Context.Systems.FirstOrDefaultAsync(s => s.Code == code, ct);
}
