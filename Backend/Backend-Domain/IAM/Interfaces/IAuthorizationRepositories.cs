using Backend.Domain.IAM.Entities;

namespace Backend.Domain.IAM.Interfaces;

public interface IAuthorizationConfigRepository
{
    Task<AuthorizationConfig?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<AuthorizationConfig>> GetByRoleIdAsync(Guid roleId, CancellationToken ct = default);
    Task<AuthorizationConfig?> GetByRoleModuleActionAsync(Guid roleId, string module, string action, CancellationToken ct = default);
    Task<List<AuthorizationConfig>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task AddAsync(AuthorizationConfig config, CancellationToken ct = default);
    void Delete(AuthorizationConfig config);
}

public interface IAuthorizationRequestRepository
{
    Task<AuthorizationRequest?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<AuthorizationRequest>> GetPendingByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<List<AuthorizationRequest>> GetPendingByAutorizadorAsync(Guid autorizadorId, CancellationToken ct = default);
    Task<List<AuthorizationRequest>> GetByCompanyAsync(Guid companyId, CancellationToken ct = default);
    Task AddAsync(AuthorizationRequest request, CancellationToken ct = default);
    void Update(AuthorizationRequest request);
}

public interface IAuthorizationGrantRepository
{
    Task<AuthorizationGrant?> GetActiveAsync(Guid userId, string module, string action, CancellationToken ct = default);
    Task<List<AuthorizationGrant>> GetActiveByUserAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(AuthorizationGrant grant, CancellationToken ct = default);
    void Deactivate(AuthorizationGrant grant);
}
