using Backend.Application.IAM.Commands.Notifications;
using Backend.Application.IAM.Queries.Notifications;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Backend_API.Controllers.IAM;

[ApiController]
[Route("api/notifications")]
public sealed class NotificationsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] bool unreadOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var userId = GetUserId();
        var result = await mediator.Send(
            new GetNotificationsQuery(userId, unreadOnly, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await mediator.Send(new GetUnreadCountQuery(userId), ct);
        return Ok(result);
    }

    [HttpPut("{notificationId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid notificationId, CancellationToken ct)
    {
        var result = await mediator.Send(new MarkNotificationAsReadCommand(notificationId), ct);
        return result.IsSuccess ? NoContent() : NotFound(result.Error);
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        var userId = GetUserId();
        await mediator.Send(new MarkAllNotificationsAsReadCommand(userId), ct);
        return NoContent();
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        return Guid.Parse(claim!.Value);
    }
}
