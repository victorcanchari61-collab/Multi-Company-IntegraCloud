using Backend.Application.IAM.Queries.Menu;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.IAM;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class MenuController(IMediator mediator, TenantContext tenantContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMenu(CancellationToken ct)
    {
        var result = await mediator.Send(
            new GetMenuQuery(tenantContext.IsOwner, tenantContext.CompanyId), ct);
        return Ok(result.Value);
    }
}
