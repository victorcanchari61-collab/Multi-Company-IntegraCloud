using Backend.Application.IAM.Queries.Permissions;
using Backend.SharedKernel;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.IAM;

[ApiController]
[Route("api/[controller]")]
public sealed class PermissionsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await mediator.Send(new GetAllPermissionsQuery(), ct);
        return Ok(result.Value);
    }
}
