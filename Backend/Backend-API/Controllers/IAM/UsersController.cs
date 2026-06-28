using Backend.Application.IAM.Commands.Users;
using Backend.Application.IAM.Queries.Users;
using Backend.SharedKernel;
using Backend_API.Filters;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.IAM;

[ApiController]
[Route("api/companies/{companyId:guid}/[controller]")]
[RequireCompanyAccess]
public sealed class UsersController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(Guid companyId, CreateUserCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { CompanyId = companyId }, ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid companyId, [FromQuery] int page = 1,
        [FromQuery] int size = 20, [FromQuery] string? search = null, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetUsersByCompanyQuery(companyId, page, size, search), ct);
        return Ok(result.Value);
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetById(Guid companyId, Guid userId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetUserByIdQuery(userId), ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPut("{userId:guid}")]
    public async Task<IActionResult> Update(Guid companyId, Guid userId, UpdateUserCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { UserId = userId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{userId:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid companyId, Guid userId, CancellationToken ct)
    {
        var result = await mediator.Send(new DeactivateUserCommand(userId), ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{userId:guid}/reactivate")]
    public async Task<IActionResult> Reactivate(Guid companyId, Guid userId, CancellationToken ct)
    {
        var result = await mediator.Send(new ReactivateUserCommand(userId), ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{userId:guid}/change-password")]
    public async Task<IActionResult> ChangePassword(Guid companyId, Guid userId, ChangePasswordCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { UserId = userId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{userId:guid}/roles")]
    public async Task<IActionResult> AssignRoles(Guid companyId, Guid userId, AssignRolesToUserCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { UserId = userId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    private IActionResult ToError(Error error) => error.Type switch
    {
        ErrorType.NotFound => NotFound(new { error.Code, error.Message }),
        ErrorType.Conflict => Conflict(new { error.Code, error.Message }),
        ErrorType.Unauthorized => Unauthorized(new { error.Code, error.Message }),
        _ => BadRequest(new { error.Code, error.Message }),
    };
}
