using Backend.Application.IAM.Queries.Documents;
using Backend.SharedKernel;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.IAM;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class LookupController(IMediator mediator) : ControllerBase
{
    [HttpGet("ruc/{ruc}")]
    public async Task<IActionResult> Ruc(string ruc, CancellationToken ct)
    {
        var result = await mediator.Send(new GetRucInfoQuery(ruc), ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    [HttpGet("dni/{dni}")]
    public async Task<IActionResult> Dni(string dni, CancellationToken ct)
    {
        var result = await mediator.Send(new GetDniInfoQuery(dni), ct);
        return result.IsSuccess ? Ok(result.Value) : ToError(result.Error!.Value);
    }

    private IActionResult ToError(Error error) => error.Type switch
    {
        ErrorType.NotFound => NotFound(new { error.Code, error.Message }),
        ErrorType.Conflict => Conflict(new { error.Code, error.Message }),
        ErrorType.Unauthorized => Unauthorized(new { error.Code, error.Message }),
        _ => BadRequest(new { error.Code, error.Message }),
    };
}
