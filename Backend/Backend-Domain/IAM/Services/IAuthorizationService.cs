using Backend.Domain.IAM.Entities;

namespace Backend.Domain.IAM.Services;

public interface IAuthorizationService
{
    Task<bool> RequiresAuthorizationAsync(Guid roleId, string module, string action, CancellationToken ct = default);
    Task<bool> CanAutoApproveAsync(Guid userId, Guid roleId, string module, string action, CancellationToken ct = default);
    Task<AuthorizationRequest> SolicitarAccesoAsync(Guid userId, string module, string action, CancellationToken ct = default);
    Task AprobarSolicitudAsync(Guid requestId, Guid autorizadorId, CancellationToken ct = default);
    Task RechazarSolicitudAsync(Guid requestId, Guid autorizadorId, CancellationToken ct = default);
    Task<List<AuthorizationRequest>> GetPendingRequestsAsync(Guid companyId, CancellationToken ct = default);
    Task<bool> UserHasEffectiveAccessAsync(Guid userId, string module, string action, CancellationToken ct = default);
}
