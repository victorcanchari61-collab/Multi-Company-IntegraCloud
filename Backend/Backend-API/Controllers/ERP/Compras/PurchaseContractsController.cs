using Backend.Application.ERP.Commands.PurchaseContracts;
using Backend.Application.ERP.Queries.PurchaseContracts;
using Backend.SharedKernel;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.ERP.Compras;

[ApiController]
[Route("api/erp/purchase-contracts")]
[Authorize]
public sealed class PurchaseContractsController(IMediator mediator, TenantContext tenant) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? supplierId, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
        var result = await mediator.Send(new GetPurchaseContractsQuery(companyId, supplierId), ct);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
        var result = await mediator.Send(new GetPurchaseContractByIdQuery(id, companyId), ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePurchaseContractCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
        var result = await mediator.Send(command with { CompanyId = companyId }, ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdatePurchaseContractCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
        var result = await mediator.Send(command with { Id = id, CompanyId = companyId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{id:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid id, SetPurchaseContractStatusCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
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
