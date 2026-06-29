using Backend.Application.ERP.Commands.ProductPresentations;
using Backend.Application.ERP.Queries.ProductPresentations;
using Backend.SharedKernel;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.ERP;

[ApiController]
[Route("api/erp/products/{productId:guid}/presentations")]
[Authorize]
public sealed class ProductPresentationsController(IMediator mediator, TenantContext tenant) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid productId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetProductPresentationsQuery(productId), ct);
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid productId, CreateProductPresentationCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(command with { CompanyId = companyId, ProductId = productId }, ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid productId, Guid id, UpdateProductPresentationCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(command with { Id = id, CompanyId = companyId, ProductId = productId }, ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new DeleteProductPresentationCommand(id), ct);
        return result.IsSuccess ? NoContent() : ToError(result.Error!.Value);
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
