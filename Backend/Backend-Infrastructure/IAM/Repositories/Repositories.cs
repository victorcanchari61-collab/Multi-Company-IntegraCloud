using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Infrastructure.IAM;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Repositories;

internal abstract class BaseRepository<T>(IamDbContext context) where T : class
{
    protected readonly IamDbContext Context = context;

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await Context.Set<T>().FindAsync([id], ct);

    public async Task<List<T>> GetAllAsync(CancellationToken ct = default)
        => await Context.Set<T>().ToListAsync(ct);

    public async Task AddAsync(T entity, CancellationToken ct = default)
        => await Context.Set<T>().AddAsync(entity, ct);

    public void Update(T entity) => Context.Set<T>().Update(entity);
    public void Delete(T entity) => Context.Set<T>().Remove(entity);
}

internal sealed class SystemRepository(IamDbContext context)
    : BaseRepository<SystemEntity>(context), ISystemRepository
{
    public async Task<SystemEntity?> GetByCodeAsync(string code, CancellationToken ct = default)
        => await Context.Systems.FirstOrDefaultAsync(s => s.Code == code, ct);
}

internal sealed class ModuleRepository(IamDbContext context)
    : BaseRepository<Module>(context), IModuleRepository
{
    public async Task<List<Module>> GetBySystemIdAsync(Guid systemId, CancellationToken ct = default)
        => await Context.Modules.Where(m => m.SystemId == systemId).ToListAsync(ct);
}

internal sealed class ViewRepository(IamDbContext context)
    : BaseRepository<View>(context), IViewRepository;

internal sealed class ComponentRepository(IamDbContext context)
    : BaseRepository<Component>(context), IComponentRepository;

internal sealed class ActionRepository(IamDbContext context)
    : BaseRepository<PermissionAction>(context), IActionRepository;

internal sealed class PermissionRepository(IamDbContext context)
    : BaseRepository<Permission>(context), IPermissionRepository
{
    public async Task<List<Permission>> GetByModuleIdAsync(Guid moduleId, CancellationToken ct = default)
        => await Context.Permissions.Where(p => p.ModuleId == moduleId).ToListAsync(ct);
}

internal sealed class CompanyRepository(IamDbContext context)
    : BaseRepository<Company>(context), ICompanyRepository
{
    public async Task<Company?> GetByTaxIdAsync(string taxId, CancellationToken ct = default)
        => await Context.Companies.FirstOrDefaultAsync(c => c.TaxId == taxId, ct);

    public async Task<Company?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await Context.Companies.FirstOrDefaultAsync(c => c.Slug == slug, ct);
}

internal sealed class CompanyModuleAccessRepository(IamDbContext context)
    : BaseRepository<CompanyModuleAccess>(context), ICompanyModuleAccessRepository
{
    public async Task<List<CompanyModuleAccess>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default)
        => await Context.CompanyModuleAccesses.Where(c => c.CompanyId == companyId).ToListAsync(ct);

    public async Task<bool> HasAccessAsync(Guid companyId, Guid moduleId, CancellationToken ct = default)
        => await Context.CompanyModuleAccesses.AnyAsync(c => c.CompanyId == companyId && c.ModuleId == moduleId, ct);
}

internal sealed class UserRepository(IamDbContext context)
    : BaseRepository<User>(context), IUserRepository
{
    public async Task<User?> GetByEmailAsync(Guid? companyId, string email, CancellationToken ct = default)
        => await Context.Users.FirstOrDefaultAsync(u => u.CompanyId == companyId && u.Email == email, ct);

    public async Task<List<User>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Users.Where(u => u.CompanyId == companyId).ToListAsync(ct);
}

internal sealed class RoleRepository(IamDbContext context)
    : BaseRepository<Role>(context), IRoleRepository
{
    public async Task<List<Role>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default)
        => await Context.Roles.Where(r => r.CompanyId == companyId).ToListAsync(ct);
}

internal sealed class RefreshTokenRepository(IamDbContext context)
    : BaseRepository<RefreshToken>(context), IRefreshTokenRepository
{
    public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default)
        => await Context.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

    public async Task RevokeAllForUserAsync(Guid userId, CancellationToken ct = default)
    {
        var activeTokens = await Context.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ToListAsync(ct);

        foreach (var token in activeTokens)
            token.Revoke();
    }
}
