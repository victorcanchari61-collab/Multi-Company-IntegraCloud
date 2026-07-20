using Backend.Application.ERP.Commands.PhysicalCounts;
using Backend.Application.ERP.Queries.PhysicalCounts;
using Backend.SharedKernel;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.ERP.Inventario;

[ApiController]
[Route("api/erp/stock/physical-counts")]
[Authorize]
public sealed class PhysicalCountsController(IMediator mediator, TenantContext tenant) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? warehouseId, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new GetPhysicalCountsQuery(companyId, warehouseId), ct);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new GetPhysicalCountByIdQuery(id, companyId), ct);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePhysicalCountCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        if (tenant.UserId is not { } userId)
            return Unauthorized();
        var result = await mediator.Send(command with { CompanyId = companyId, UserId = userId }, ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPost("{id:guid}/lines")]
    public async Task<IActionResult> AddLine(Guid id, AddCountLineCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { PhysicalCountId = id }, ct);
        return result.IsSuccess ? Ok() : ToError(result.Error!.Value);
    }

    [HttpPut("lines/{lineId:guid}")]
    public async Task<IActionResult> RecordLine(Guid lineId, RecordCountLineCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { Id = lineId }, ct);
        return result.IsSuccess ? Ok() : ToError(result.Error!.Value);
    }

    [HttpPut("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        if (tenant.UserId is not { } userId)
            return Unauthorized();
        var result = await mediator.Send(new CompletePhysicalCountCommand(id, companyId, userId), ct);
        return result.IsSuccess ? Ok() : ToError(result.Error!.Value);
    }

    [HttpPut("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        if (tenant.UserId is not { } userId)
            return Unauthorized();
        var result = await mediator.Send(new ApprovePhysicalCountCommand(id, companyId, userId), ct);
        return result.IsSuccess ? Ok() : ToError(result.Error!.Value);
    }

    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new CancelPhysicalCountCommand(id, companyId), ct);
        return result.IsSuccess ? Ok() : ToError(result.Error!.Value);
    }

    private IActionResult NoTenant() =>
        BadRequest(new { code = "tenant.required", message = "No hay empresa en el contexto del usuario." });

    private IActionResult ToError(Error error) => error.Type switch
    {
        ErrorType.NotFound => NotFound(new { error.Code, error.Message }),
        ErrorType.Conflict => Conflict(new { error.Code, error.Message }),
        _ => BadRequest(new { error.Code, error.Message }),
    };
}
