using Backend.Application.IAM.Queries.Menu;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.IAM;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class MenuController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMenu(CancellationToken ct)
    {
        var result = await mediator.Send(new GetMenuQuery(), ct);
        return Ok(result.Value);
    }
}
