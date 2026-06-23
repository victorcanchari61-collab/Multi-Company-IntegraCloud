using Backend.Domain.IAM.Entities;
using Backend.SharedKernel;

namespace Backend.Domain.IAM.Repositories;

public interface ISystemRepository : IRepository<SystemEntity>
{
    Task<SystemEntity?> GetByCodeAsync(string code, CancellationToken ct = default);
}

public interface IModuleRepository : IRepository<Module>
{
    Task<List<Module>> GetBySystemIdAsync(Guid systemId, CancellationToken ct = default);
}

public interface IViewRepository : IRepository<View>;
public interface IComponentRepository : IRepository<Component>;
public interface IActionRepository : IRepository<PermissionAction>;
public interface IPermissionRepository : IRepository<Permission>
{
    Task<List<Permission>> GetByModuleIdAsync(Guid moduleId, CancellationToken ct = default);
}

public interface ICompanyRepository : IRepository<Company>
{
    Task<Company?> GetByTaxIdAsync(string taxId, CancellationToken ct = default);
    Task<Company?> GetBySlugAsync(string slug, CancellationToken ct = default);
}

public interface ICompanyModuleAccessRepository : IRepository<CompanyModuleAccess>
{
    Task<List<CompanyModuleAccess>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> HasAccessAsync(Guid companyId, Guid moduleId, CancellationToken ct = default);
}

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(Guid? companyId, string email, CancellationToken ct = default);
    Task<List<User>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default);
}

public interface IRoleRepository : IRepository<Role>
{
    Task<List<Role>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default);
}

public interface IRefreshTokenRepository : IRepository<RefreshToken>
{
    Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default);
    Task RevokeAllForUserAsync(Guid userId, CancellationToken ct = default);
}
