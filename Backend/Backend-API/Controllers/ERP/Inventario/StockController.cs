using Backend.Application.ERP.Commands.Stock;
using Backend.Application.ERP.Queries.Stock;
using Backend.SharedKernel;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.ERP.Inventario;

[ApiController]
[Route("api/erp/stock")]
[Authorize]
public sealed class StockController(IMediator mediator, TenantContext tenant) : ControllerBase
{
    [HttpGet("warehouse/{warehouseId:guid}")]
    public async Task<IActionResult> GetByWarehouse(Guid warehouseId, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new GetStockByWarehouseQuery(companyId, warehouseId), ct);
        return Ok(result.Value);
    }

    [HttpPost("movement")]
    public async Task<IActionResult> CreateMovement(CreateStockMovementCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        if (tenant.UserId is not { } userId)
            return Unauthorized();
        var result = await mediator.Send(command with { CompanyId = companyId, UserId = userId }, ct);
        return result.IsSuccess ? Ok() : ToError(result.Error!.Value);
    }

    [HttpGet("movements")]
    public async Task<IActionResult> GetMovements(
        [FromQuery] Guid? warehouseId, [FromQuery] Guid? productId, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new GetStockMovementsQuery(companyId, warehouseId, productId), ct);
        return Ok(result.Value);
    }

    [HttpGet("valuation")]
    public async Task<IActionResult> GetValuation([FromQuery] Guid? warehouseId, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new GetStockValuationQuery(companyId, warehouseId), ct);
        return Ok(result.Value);
    }

    [HttpGet("low-reorder")]
    public async Task<IActionResult> GetLowReorder(CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new GetStockLowByMinQuery(companyId), ct);
        return Ok(result.Value);
    }

    [HttpPut("{id:guid}/levels")]
    public async Task<IActionResult> SetLevels(Guid id, SetStockLevelsCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new SetStockLevelsByIdCommand(
            id, companyId, command.MinStock, command.MaxStock), ct);
        return result.IsSuccess ? Ok() : ToError(result.Error!.Value);
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
