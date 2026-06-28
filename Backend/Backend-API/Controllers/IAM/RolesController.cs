using Backend.Application.IAM.Commands.Roles;
using Backend.Application.IAM.Queries.Roles;
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
public sealed class RolesController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(Guid companyId, CreateRoleCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { CompanyId = companyId }, ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid companyId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetRolesByCompanyQuery(companyId), ct);
        return Ok(result.Value);
    }

    [HttpGet("{roleId:guid}")]
    public async Task<IActionResult> GetById(Guid companyId, Guid roleId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetRoleByIdQuery(roleId), ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPut("{roleId:guid}")]
    public async Task<IActionResult> Update(Guid companyId, Guid roleId, UpdateRoleCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { RoleId = roleId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpDelete("{roleId:guid}")]
    public async Task<IActionResult> Delete(Guid companyId, Guid roleId, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteRoleCommand(roleId), ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{roleId:guid}/permissions")]
    public async Task<IActionResult> AssignPermissions(Guid companyId, Guid roleId,
        AssignPermissionsToRoleCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { RoleId = roleId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    private IActionResult ToError(Error error) => error.Type switch
    {
        ErrorType.NotFound => NotFound(new { error.Code, error.Message }),
        ErrorType.Forbidden => Forbid(),
        ErrorType.Conflict => Conflict(new { error.Code, error.Message }),
        _ => BadRequest(new { error.Code, error.Message }),
    };
}
