using Backend.Application.IAM.Queries.Permissions;
using Backend_API.Middleware;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.IAM;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class PermissionsController(IMediator mediator, TenantContext tenantContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        // Dueño: catálogo completo. Empresa: solo los permisos de SUS módulos.
        if (tenantContext.IsOwner)
        {
            var ownerResult = await mediator.Send(new GetAllPermissionsQuery(), ct);
            return Ok(ownerResult.Value);
        }

        var companyResult = await mediator.Send(
            new GetCompanyPermissionsCatalogQuery(tenantContext.CompanyId!.Value), ct);
        return Ok(companyResult.Value);
    }
}
