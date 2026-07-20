using Backend.Application.ERP.Commands.StockReservations;
using Backend.Application.ERP.Queries.StockReservations;
using Backend.SharedKernel;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.ERP.Inventario;

[ApiController]
[Route("api/erp/stock/reservations")]
[Authorize]
public sealed class StockReservationsController(IMediator mediator, TenantContext tenant) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? warehouseId, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new GetReservationsQuery(companyId, warehouseId), ct);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateReservationCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        if (tenant.UserId is not { } userId)
            return Unauthorized();
        var result = await mediator.Send(command with { CompanyId = companyId, UserId = userId }, ct);
        return result.IsSuccess ? Ok() : ToError(result.Error!.Value);
    }

    [HttpPut("{id:guid}/release")]
    public async Task<IActionResult> Release(Guid id, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(new ReleaseReservationCommand(id, companyId), ct);
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
