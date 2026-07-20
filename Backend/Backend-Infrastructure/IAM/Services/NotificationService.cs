using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;
using Backend.Infrastructure.IAM.Hubs;
using Backend.SharedKernel;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM.Services;

public sealed class NotificationService : INotificationService
{
    private readonly INotificationRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(
        INotificationRepository repo,
        IUnitOfWork uow,
        IHubContext<NotificationHub> hub)
    {
        _repo = repo;
        _uow = uow;
        _hub = hub;
    }

    public async Task NotifyAsync(Guid userId, Guid companyId, string type,
        string title, string message, string? referenceType = null,
        string? referenceId = null, CancellationToken ct = default)
    {
        var notification = new Notification(
            Guid.NewGuid(), userId, companyId, type, title, message,
            referenceType, referenceId);

        await _repo.AddAsync(notification, ct);
        await _uow.SaveChangesAsync(ct);

        await _hub.Clients.Group($"user:{userId}").SendAsync("ReceiveNotification", new
        {
            notification.Id,
            notification.Type,
            notification.Title,
            notification.Message,
            notification.ReferenceType,
            notification.ReferenceId,
            notification.CreatedAt,
            notification.IsRead,
        }, ct);
    }

    public async Task NotifyMultipleAsync(IEnumerable<Guid> userIds, Guid companyId,
        string type, string title, string message, string? referenceType = null,
        string? referenceId = null, CancellationToken ct = default)
    {
        var notifications = userIds.Select(userId => new Notification(
            Guid.NewGuid(), userId, companyId, type, title, message,
            referenceType, referenceId)).ToList();

        foreach (var notification in notifications)
            await _repo.AddAsync(notification, ct);

        await _uow.SaveChangesAsync(ct);

        var dto = notifications.Select(n => new
        {
            n.Id, n.Type, n.Title, n.Message,
            n.ReferenceType, n.ReferenceId, n.CreatedAt, n.IsRead
        }).ToList();

        foreach (var userId in userIds)
        {
            await _hub.Clients.Group($"user:{userId}").SendAsync("ReceiveNotification",
                dto.First(n => n.Id == notifications.First(x => x.UserId == userId).Id), ct);
        }
    }
}
