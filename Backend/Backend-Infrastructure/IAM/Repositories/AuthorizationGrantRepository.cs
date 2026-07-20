using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Interfaces;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

public sealed class AuthorizationGrantRepository : IAuthorizationGrantRepository
{
    private readonly IamDbContext _db;

    public AuthorizationGrantRepository(IamDbContext db) => _db = db;

    public async Task<AuthorizationGrant?> GetActiveAsync(Guid userId, string module, string action, CancellationToken ct = default)
        => await _db.Set<AuthorizationGrant>()
            .Where(x => x.UserId == userId && x.Module == module && x.Action == action && x.Activa)
            .FirstOrDefaultAsync(ct);

    public async Task<List<AuthorizationGrant>> GetActiveByUserAsync(Guid userId, CancellationToken ct = default)
        => await _db.Set<AuthorizationGrant>()
            .Where(x => x.UserId == userId && x.Activa)
            .ToListAsync(ct);

    public async Task AddAsync(AuthorizationGrant grant, CancellationToken ct = default)
        => await _db.Set<AuthorizationGrant>().AddAsync(grant, ct);

    public void Deactivate(AuthorizationGrant grant)
        => _db.Set<AuthorizationGrant>().Update(grant);
}
