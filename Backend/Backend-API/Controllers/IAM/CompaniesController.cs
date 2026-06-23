using Backend.Application.IAM.Commands.Companies;
using Backend.Application.IAM.Queries.Companies;
using Backend.SharedKernel;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.IAM;

[ApiController]
[Route("api/[controller]")]
public sealed class CompaniesController(IMediator mediator, TenantContext tenantContext) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateCompanyCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int size = 20,
        [FromQuery] int? status = null, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetCompaniesQuery(page, size, status), ct);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetCompanyByIdQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPost("{id:guid}/suspend")]
    public async Task<IActionResult> Suspend(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new SuspendCompanyCommand(id), ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new ActivateCompanyCommand(id), ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{id:guid}/modules")]
    public async Task<IActionResult> GrantModules(Guid id, GrantCompanyModuleAccessCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { CompanyId = id }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpDelete("{id:guid}/modules")]
    public async Task<IActionResult> RevokeModules(Guid id, RevokeCompanyModuleAccessCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { CompanyId = id }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    private IActionResult ToError(Error error) => error.Type switch
    {
        ErrorType.NotFound => NotFound(new { error.Code, error.Message }),
        ErrorType.Conflict => Conflict(new { error.Code, error.Message }),
        _ => BadRequest(new { error.Code, error.Message }),
    };
}
