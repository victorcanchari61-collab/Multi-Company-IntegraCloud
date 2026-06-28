using Backend.Application.ERP.Commands.Subcategories;
using Backend.Application.ERP.Queries.Subcategories;
using Backend.SharedKernel;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.ERP;

[ApiController]
[Route("api/erp/subcategories")]
[Authorize]
public sealed class SubcategoriesController(IMediator mediator, TenantContext tenant) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? categoryId, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new GetSubcategoriesQuery(companyId, categoryId), ct);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateSubcategoryCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(command with { CompanyId = companyId }, ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateSubcategoryCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(command with { Id = id, CompanyId = companyId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{id:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid id, SetSubcategoryStatusCommand command, CancellationToken ct)
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
