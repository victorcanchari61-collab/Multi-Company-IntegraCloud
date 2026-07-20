using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using MediatR;

namespace Backend.Application.IAM.Queries.Notifications;

public sealed record GetUnreadCountQuery(Guid UserId) : IRequest<UnreadCountDto>;

internal sealed class GetUnreadCountHandler(INotificationRepository repo)
    : IRequestHandler<GetUnreadCountQuery, UnreadCountDto>
{
    public async Task<UnreadCountDto> Handle(GetUnreadCountQuery query, CancellationToken ct)
    {
        var count = await repo.GetUnreadCountAsync(query.UserId, ct);
        return new UnreadCountDto(count);
    }
}
