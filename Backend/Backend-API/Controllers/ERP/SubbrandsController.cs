using Backend.Application.ERP.Commands.Subbrands;
using Backend.Application.ERP.Queries.Subbrands;
using Backend.SharedKernel;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.ERP;

[ApiController]
[Route("api/erp/subbrands")]
[Authorize]
public sealed class SubbrandsController(IMediator mediator, TenantContext tenant) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? brandId, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new GetSubbrandsQuery(companyId, brandId), ct);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateSubbrandCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(command with { CompanyId = companyId }, ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateSubbrandCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(command with { Id = id, CompanyId = companyId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{id:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid id, SetSubbrandStatusCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(command with { Id = id, CompanyId = companyId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    private IActionResult NoTenant() =>
        BadRequest(new { code = "tenant.required", message = "No hay empresa en el contexto del usuario." });

    private IActionResult ToError(Error error) => error.Type switch
    {
        ErrorType.NotFound => NotFound(new { error.Code, error.Message }),
        ErrorType.Conflict => Conflict(new { error.Code, error.Message }),
        ErrorType.Unauthorized => Unauthorized(new { error.Code, error.Message }),
        _ => BadRequest(new { error.Code, error.Message }),
    };
}
