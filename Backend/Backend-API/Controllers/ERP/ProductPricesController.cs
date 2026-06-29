using Backend.Application.ERP.Commands.ProductPrices;
using Backend.Application.ERP.Queries.ProductPrices;
using Backend.SharedKernel;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.ERP;

[ApiController]
[Route("api/erp/products/{productId:guid}/prices")]
[Authorize]
public sealed class ProductPricesController(IMediator mediator, TenantContext tenant) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid productId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetProductPricesQuery(productId), ct);
        return Ok(result.Value);
    }

    [HttpPut]
    public async Task<IActionResult> SetPrices(Guid productId, SetProductPricesCommand command, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return NoTenant();
        var result = await mediator.Send(command with { CompanyId = companyId, ProductId = productId }, ct);
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
