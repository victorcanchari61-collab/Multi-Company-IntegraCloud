using Backend.Application.ERP.Queries.Kardex;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.ERP.Inventario;

[ApiController]
[Route("api/erp/kardex")]
[Authorize]
public sealed class KardexController(IMediator mediator, TenantContext tenant) : ControllerBase
{
    [HttpGet("product/{productId:guid}")]
    public async Task<IActionResult> GetByProduct(Guid productId, CancellationToken ct)
    {
        if (tenant.CompanyId is not { } companyId)
            return BadRequest(new { code = "tenant.required", message = "No hay empresa en el contexto del usuario." });
        var result = await mediator.Send(new GetKardexByProductQuery(companyId, productId), ct);
        return Ok(result.Value);
    }
}
