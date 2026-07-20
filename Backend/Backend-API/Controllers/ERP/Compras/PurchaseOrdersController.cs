using Backend.Application.ERP.Commands.PurchaseOrders;
using Backend.Application.ERP.Documents.Compras;
using Backend.Application.ERP.Queries.PurchaseOrders;
using Backend.SharedKernel;
using Backend.SharedKernel.Services;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.ERP.Compras;

[ApiController]
[Route("api/erp/purchase-orders")]
[Authorize]
public sealed class PurchaseOrdersController(IMediator mediator, TenantContext tenant, IPdfService pdfService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
        var result = await mediator.Send(new GetPurchaseOrdersQuery(companyId), ct);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
        var result = await mediator.Send(new GetPurchaseOrderByIdQuery(id, companyId), ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePurchaseOrderCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
        var result = await mediator.Send(command with { CompanyId = companyId }, ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdatePurchaseOrderCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
        var result = await mediator.Send(command with { Id = id, CompanyId = companyId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdatePurchaseOrderStatusCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
        var result = await mediator.Send(command with { Id = id, CompanyId = companyId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpPost("{id:guid}/receive")]
    public async Task<IActionResult> Receive(Guid id, ReceivePurchaseOrderCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
        var result = await mediator.Send(command with { Id = id, CompanyId = companyId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpGet("{id:guid}/pdf")]
    public async Task<IActionResult> DownloadPdf(Guid id, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId) return NoTenant();
        var result = await mediator.Send(new GetPurchaseOrderByIdQuery(id, companyId), ct);
        if (!result.IsSuccess || result.Value is null)
            return ToError(result.Error!.Value);

        var doc = PurchaseOrderPdfBuilder.Build(result.Value);
        var pdf = pdfService.GeneratePdf(doc);
        return File(pdf, "application/pdf", $"OC-{result.Value.OrderNumber}.pdf");
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
