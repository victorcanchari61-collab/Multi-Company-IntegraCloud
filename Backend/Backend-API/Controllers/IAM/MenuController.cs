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
        if (tenantContext.IsOwner)
        {
            var ownerResult = await mediator.Send(new GetOwnerMenuQuery(), ct);
            return Ok(ownerResult.Value);
        }

        var companyResult = await mediator.Send(
            new GetCompanyMenuQuery(tenantContext.CompanyId!.Value), ct);
        return Ok(companyResult.Value);
    }
}
