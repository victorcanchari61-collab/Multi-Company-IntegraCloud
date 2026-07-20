using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Interfaces;
using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;
using Backend.SharedKernel;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers.IAM;

[ApiController]
[Route("api/companies/{companyId:guid}/authorizations")]
public class AuthorizationController : ControllerBase
{
    private readonly Domain.IAM.Services.IAuthorizationService _authService;
    private readonly IAuthorizationConfigRepository _configRepo;
    private readonly IAuthorizationRequestRepository _requestRepo;
    private readonly IAuthorizationGrantRepository _grantRepo;
    private readonly IRoleRepository _roleRepo;
    private readonly IUnitOfWork _uow;

    public AuthorizationController(
        IAuthorizationService authService,
        IAuthorizationConfigRepository configRepo,
        IAuthorizationRequestRepository requestRepo,
        IAuthorizationGrantRepository grantRepo,
        IRoleRepository roleRepo,
        IUnitOfWork uow)
    {
        _authService = authService;
        _configRepo = configRepo;
        _requestRepo = requestRepo;
        _grantRepo = grantRepo;
        _roleRepo = roleRepo;
        _uow = uow;
    }

    // ── Config ──

    [HttpGet("configs")]
    public async Task<IActionResult> GetConfigs(Guid companyId, CancellationToken ct)
    {
        var configs = await _configRepo.GetByCompanyAsync(companyId, ct);
        return Ok(configs);
    }

    [HttpPost("configs")]
    public async Task<IActionResult> CreateConfig(Guid companyId,
        [FromBody] CreateAuthorizationConfigRequest request, CancellationToken ct)
    {
        var config = new AuthorizationConfig(
            request.RoleId, request.Module, request.Action,
            request.TipoAutorizador ?? "usuario",
            request.AutorizadorId, request.CargoAutorizador,
            request.RoleAutorizadorId);

        await _configRepo.AddAsync(config, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(config);
    }

    [HttpDelete("configs/{configId:guid}")]
    public async Task<IActionResult> DeleteConfig(Guid companyId, Guid configId, CancellationToken ct)
    {
        var config = await _configRepo.GetByIdAsync(configId, ct);
        if (config == null) return NotFound();
        _configRepo.Delete(config);
        await _uow.SaveChangesAsync(ct);
        return NoContent();
    }

    // ── Requests ──

    [HttpGet("requests")]
    public async Task<IActionResult> GetPendingRequests(Guid companyId, CancellationToken ct)
    {
        var requests = await _authService.GetPendingRequestsAsync(companyId, ct);
        return Ok(requests);
    }

    [HttpPost("requests/{requestId:guid}/approve")]
    public async Task<IActionResult> ApproveRequest(Guid companyId, Guid requestId, CancellationToken ct)
    {
        var userId = GetUserId();
        await _authService.AprobarSolicitudAsync(requestId, userId, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(new { message = "Solicitud aprobada" });
    }

    [HttpPost("requests/{requestId:guid}/reject")]
    public async Task<IActionResult> RejectRequest(Guid companyId, Guid requestId, CancellationToken ct)
    {
        var userId = GetUserId();
        await _authService.RechazarSolicitudAsync(requestId, userId, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(new { message = "Solicitud rechazada" });
    }

    // ── Check ──

    [HttpPost("check")]
    public async Task<IActionResult> CheckAccess(Guid companyId,
        [FromBody] CheckAccessRequest request, CancellationToken ct)
    {
        var hasAccess = await _authService.UserHasEffectiveAccessAsync(
            request.UserId, request.Module, request.Action, ct);
        return Ok(new { hasAccess });
    }

    // ── Grants ──

    [HttpGet("grants/{userId:guid}")]
    public async Task<IActionResult> GetUserGrants(Guid companyId, Guid userId, CancellationToken ct)
    {
        var grants = await _grantRepo.GetActiveByUserAsync(userId, ct);
        return Ok(grants);
    }

    // ── Helpers ──

    private Guid GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        return Guid.Parse(claim!.Value);
    }
}

// ── Request DTOs ──

public sealed record CreateAuthorizationConfigRequest(
    Guid RoleId,
    string Module,
    string Action,
    string? TipoAutorizador,
    Guid? AutorizadorId,
    string? CargoAutorizador,
    Guid? RoleAutorizadorId
);

public sealed record CheckAccessRequest(
    Guid UserId,
    string Module,
    string Action
);
