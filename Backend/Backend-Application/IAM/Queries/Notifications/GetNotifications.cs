using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using MediatR;

namespace Backend.Application.IAM.Queries.Notifications;

public sealed record GetNotificationsQuery(
    Guid UserId, bool UnreadOnly = false, int Page = 1, int PageSize = 20
) : IRequest<NotificationListDto>;

public sealed record NotificationListDto(
    List<NotificationDto> Items, int TotalCount, int UnreadCount, int Page, int PageSize
);

internal sealed class GetNotificationsHandler(INotificationRepository repo)
    : IRequestHandler<GetNotificationsQuery, NotificationListDto>
{
    public async Task<NotificationListDto> Handle(GetNotificationsQuery query, CancellationToken ct)
    {
        var items = await repo.GetByUserIdAsync(query.UserId, query.UnreadOnly,
            query.Page, query.PageSize, ct);
        var unreadCount = await repo.GetUnreadCountAsync(query.UserId, ct);

        return new NotificationListDto(
            items.Select(n => new NotificationDto(
                n.Id, n.Type, n.Title, n.Message,
                n.ReferenceType, n.ReferenceId,
                n.IsRead, n.CreatedAt, n.ReadAt
            )).ToList(),
            items.Count, unreadCount, query.Page, query.PageSize);
    }
}
