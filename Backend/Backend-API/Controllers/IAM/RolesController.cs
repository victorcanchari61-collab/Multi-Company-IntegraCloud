using Backend.Application.IAM.Commands.Roles;
using Backend.Application.IAM.Queries.Users;
using Backend.SharedKernel;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.IAM;

[ApiController]
[Route("api/companies/{companyId:guid}/[controller]")]
public sealed class RolesController(IMediator mediator, TenantContext tenantContext) : ControllerBase
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
        _ => BadRequest(new { error.Code, error.Message }),
    };
}
