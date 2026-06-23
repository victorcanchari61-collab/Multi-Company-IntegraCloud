using Backend.Application.IAM.Commands.Auth;
using Backend.Application.IAM.Queries.Auth;
using Backend.SharedKernel;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.IAM;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(IMediator mediator, TenantContext tenantContext) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshTokenCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(LogoutCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        if (tenantContext.UserId is null)
            return Unauthorized();

        var result = await mediator.Send(new GetMeQuery(tenantContext.UserId.Value), ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpGet("me/permissions")]
    public async Task<IActionResult> GetMyPermissions(CancellationToken ct)
    {
        if (tenantContext.UserId is null)
            return Unauthorized();

        var result = await mediator.Send(new GetMyPermissionsQuery(tenantContext.UserId.Value), ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    private IActionResult ToError(Error error) => error.Type switch
    {
        ErrorType.NotFound => NotFound(new { error.Code, error.Message }),
        ErrorType.Validation => BadRequest(new { error.Code, error.Message }),
        ErrorType.Conflict => Conflict(new { error.Code, error.Message }),
        ErrorType.Unauthorized => Unauthorized(new { error.Code, error.Message }),
        ErrorType.Forbidden => Forbid(),
        _ => StatusCode(500, new { error.Code, error.Message }),
    };
}
