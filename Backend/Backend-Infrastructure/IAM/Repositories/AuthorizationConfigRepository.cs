using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Interfaces;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

public sealed class AuthorizationConfigRepository : IAuthorizationConfigRepository
{
    private readonly IamDbContext _db;

    public AuthorizationConfigRepository(IamDbContext db) => _db = db;

    public async Task<AuthorizationConfig?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Set<AuthorizationConfig>().FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<List<AuthorizationConfig>> GetByRoleIdAsync(Guid roleId, CancellationToken ct = default)
        => await _db.Set<AuthorizationConfig>().Where(x => x.RoleId == roleId).ToListAsync(ct);

    public async Task<AuthorizationConfig?> GetByRoleModuleActionAsync(Guid roleId, string module, string action, CancellationToken ct = default)
        => await _db.Set<AuthorizationConfig>().FirstOrDefaultAsync(x => x.RoleId == roleId && x.Module == module && x.Action == action, ct);

    public async Task<List<AuthorizationConfig>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default)
        => await _db.Set<AuthorizationConfig>()
            .Include(x => x.Role)
            .Where(x => x.Role.CompanyId == companyId)
            .ToListAsync(ct);

    public async Task AddAsync(AuthorizationConfig config, CancellationToken ct = default)
        => await _db.Set<AuthorizationConfig>().AddAsync(config, ct);

    public void Delete(AuthorizationConfig config)
        => _db.Set<AuthorizationConfig>().Remove(config);
}
