using Backend.Application.IAM.Queries.Permissions;
using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;
using Backend.SharedKernel;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers.IAM;

[ApiController]
[Route("api/permissions")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUserRepository _userRepo;
    private readonly IEffectiveAccessService _effectiveAccess;

    public PermissionsController(
        IMediator mediator,
        IUserRepository userRepo,
        IEffectiveAccessService effectiveAccess)
    {
        _mediator = mediator;
        _userRepo = userRepo;
        _effectiveAccess = effectiveAccess;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllPermissionsQuery(), ct);
        return result.IsSuccess
            ? Ok(result.Value)
            : ToError(result.Error!.Value);
    }

    /// <summary>
    /// Devuelve la lista de todas las restricciones activas para un usuario en una compañía.
    /// </summary>
    [HttpGet("restrictions")]
    public async Task<IActionResult> GetRestrictions(CancellationToken ct)
    {
        var userId = GetUserId();
        var access = await _effectiveAccess.GetForUserAsync(userId, ct);
        if (access == null)
            return NotFound(new { message = "Usuario no encontrado" });

        return Ok(new
        {
            isOwner = false, // computed client-side from /auth/me
            allRestrictions = access.Restrictions
        });
    }

    /// <summary>
    /// Verifica si un usuario tiene acceso a un módulo/acción específico.
    /// </summary>
    [HttpPost("users/{userId:guid}/check")]
    public async Task<IActionResult> CheckUserPermission(
        Guid userId,
        [FromBody] CheckPermissionRequest request,
        CancellationToken ct)
    {
        var user = await _userRepo.GetByIdAsync(userId, ct);
        if (user == null)
            return NotFound(new { message = "Usuario no encontrado" });

        bool canAccess;
        if (user.IsOwner)
        {
            canAccess = true;
        }
        else
        {
            var access = await _effectiveAccess.GetForUserAsync(userId, ct);
            canAccess = access == null || !access.Restrictions.Contains(request.PermissionKey);
        }

        return Ok(new
        {
            userId,
            permissionKey = request.PermissionKey,
            canAccess,
            reason = canAccess
                ? "allowed"
                : "restricted"
        });
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        return Guid.Parse(claim!.Value);
    }

    private IActionResult ToError(Error error) => error.Type switch
    {
        ErrorType.NotFound => NotFound(new { error.Code, error.Message }),
        ErrorType.Forbidden => Forbid(),
        ErrorType.Conflict => Conflict(new { error.Code, error.Message }),
        _ => BadRequest(new { error.Code, error.Message }),
    };
}

public sealed record CheckPermissionRequest(string PermissionKey);
