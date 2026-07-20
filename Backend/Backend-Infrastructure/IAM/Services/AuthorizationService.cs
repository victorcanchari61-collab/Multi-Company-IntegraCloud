using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Interfaces;
using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;

namespace Backend.Infrastructure.IAM.Services;

public sealed class AuthorizationService : IAuthorizationService
{
    private readonly IAuthorizationConfigRepository _configRepo;
    private readonly IAuthorizationRequestRepository _requestRepo;
    private readonly IAuthorizationGrantRepository _grantRepo;
    private readonly IUserRepository _userRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly INotificationService _notificationService;

    public AuthorizationService(
        IAuthorizationConfigRepository configRepo,
        IAuthorizationRequestRepository requestRepo,
        IAuthorizationGrantRepository grantRepo,
        IUserRepository userRepo,
        IRoleRepository roleRepo,
        INotificationService notificationService)
    {
        _configRepo = configRepo;
        _requestRepo = requestRepo;
        _grantRepo = grantRepo;
        _userRepo = userRepo;
        _roleRepo = roleRepo;
        _notificationService = notificationService;
    }

    public async Task<bool> RequiresAuthorizationAsync(Guid roleId, string module, string action, CancellationToken ct = default)
    {
        var config = await _configRepo.GetByRoleModuleActionAsync(roleId, module, action, ct);
        return config?.RequiereAutorizacion ?? false;
    }

    public async Task<bool> CanAutoApproveAsync(Guid userId, Guid roleId, string module, string action, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct);
        if (user?.IsOwner == true) return true;

        var config = await _configRepo.GetByRoleModuleActionAsync(roleId, module, action, ct);
        if (config == null || !config.RequiereAutorizacion) return true;

        if (config.TipoAutorizador == "usuario" && config.AutorizadorId == userId)
            return true;

        if (config.TipoAutorizador == "role")
        {
            var userWithRoles = await _userRepo.GetByIdWithRolesAsync(userId, ct);
            if (userWithRoles?.UserRoles.Any(ur => ur.RoleId == config.RoleAutorizadorId) == true)
                return true;
        }

        return false;
    }

    public async Task<AuthorizationRequest> SolicitarAccesoAsync(Guid userId, string module, string action, CancellationToken ct = default)
    {
        var request = new AuthorizationRequest(userId, module, action);
        await _requestRepo.AddAsync(request, ct);

        var user = await _userRepo.GetByIdWithRolesAsync(userId, ct);
        var companyId = user?.CompanyId;
        if (companyId.HasValue)
        {
            var roleId = user.UserRoles.FirstOrDefault()?.RoleId ?? Guid.Empty;
            var config = await _configRepo.GetByRoleModuleActionAsync(roleId, module, action, ct);
            if (config != null)
            {
                var approverUserIds = await ResolveApproverUserIdsAsync(config, roleId, ct);
                if (approverUserIds.Count > 0)
                {
                    await _notificationService.NotifyMultipleAsync(approverUserIds, companyId.Value,
                        "authorization.request", "Nueva solicitud de acceso",
                        $"{user?.FullName ?? "Un usuario"} solicita acceso a {module}/{action}",
                        "authorization_request", request.Id.ToString(), ct);
                }
            }
        }

        return request;
    }

    private async Task<List<Guid>> ResolveApproverUserIdsAsync(AuthorizationConfig config, Guid userRoleId, CancellationToken ct)
    {
        var userIds = new List<Guid>();

        if (config.TipoAutorizador == "usuario" && config.AutorizadorId.HasValue)
        {
            userIds.Add(config.AutorizadorId.Value);
        }
        else if (config.TipoAutorizador == "role" && config.RoleAutorizadorId.HasValue)
        {
            var users = await _userRepo.GetByRoleIdAsync(config.RoleAutorizadorId.Value, ct);
            userIds.AddRange(users.Select(u => u.Id));
        }
        else if (config.TipoAutorizador == "jerarquia" && userRoleId != Guid.Empty)
        {
            var visited = new HashSet<Guid>();
            var currentRoleId = userRoleId;

            while (currentRoleId != Guid.Empty && visited.Add(currentRoleId))
            {
                var role = await _roleRepo.GetByIdWithParentAsync(currentRoleId, ct);
                if (role == null) break;

                var users = await _userRepo.GetByRoleIdAsync(currentRoleId, ct);
                if (users.Count > 0 && currentRoleId != userRoleId)
                {
                    userIds.AddRange(users.Select(u => u.Id));
                    break;
                }

                currentRoleId = role.ParentRoleId ?? Guid.Empty;
            }
        }

        return userIds;
    }

    public async Task AprobarSolicitudAsync(Guid requestId, Guid autorizadorId, CancellationToken ct = default)
    {
        var request = await _requestRepo.GetByIdAsync(requestId, ct)
            ?? throw new KeyNotFoundException($"Solicitud {requestId} no encontrada");

        request.Approve(autorizadorId);
        _requestRepo.Update(request);

        var grant = new AuthorizationGrant(request.UserId, request.Module, request.Action, "permanente");
        await _grantRepo.AddAsync(grant, ct);

        var autorizador = await _userRepo.GetByIdAsync(autorizadorId, ct);
        var requesterUser = await _userRepo.GetByIdAsync(request.UserId, ct);
        if (requesterUser?.CompanyId != null)
        {
            await _notificationService.NotifyAsync(request.UserId, requesterUser.CompanyId.Value,
                "authorization.approved", "Solicitud aprobada",
                $"Tu solicitud de acceso a {request.Module}/{request.Action} fue aprobada por {autorizador?.FullName ?? "un superior"}",
                "authorization_request", request.Id.ToString(), ct);
        }
    }

    public async Task RechazarSolicitudAsync(Guid requestId, Guid autorizadorId, CancellationToken ct = default)
    {
        var request = await _requestRepo.GetByIdAsync(requestId, ct)
            ?? throw new KeyNotFoundException($"Solicitud {requestId} no encontrada");

        request.Reject(autorizadorId);
        _requestRepo.Update(request);

        var autorizador = await _userRepo.GetByIdAsync(autorizadorId, ct);
        var requesterUser = await _userRepo.GetByIdAsync(request.UserId, ct);
        if (requesterUser?.CompanyId != null)
        {
            await _notificationService.NotifyAsync(request.UserId, requesterUser.CompanyId.Value,
                "authorization.rejected", "Solicitud rechazada",
                $"Tu solicitud de acceso a {request.Module}/{request.Action} fue rechazada por {autorizador?.FullName ?? "un superior"}",
                "authorization_request", request.Id.ToString(), ct);
        }
    }

    public async Task<List<AuthorizationRequest>> GetPendingRequestsAsync(Guid companyId, CancellationToken ct = default)
    {
        return await _requestRepo.GetByCompanyAsync(companyId, ct);
    }

    public async Task<bool> UserHasEffectiveAccessAsync(Guid userId, string module, string action, CancellationToken ct = default)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct);
        if (user?.IsOwner == true) return true;

        var grant = await _grantRepo.GetActiveAsync(userId, module, action, ct);
        if (grant != null && grant.Activa)
        {
            if (grant.Tipo == "una_vez")
            {
                grant.Deactivate();
                return true;
            }
            if (grant.Tipo == "permanente" && (!grant.ExpiresAt.HasValue || grant.ExpiresAt > DateTime.UtcNow))
                return true;
        }

        return false;
    }
}
