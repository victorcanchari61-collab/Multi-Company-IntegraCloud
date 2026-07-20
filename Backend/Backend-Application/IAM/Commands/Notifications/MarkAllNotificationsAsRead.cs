using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Notifications;

public sealed record MarkAllNotificationsAsReadCommand(Guid UserId) : IRequest<Result>;

internal sealed class MarkAllNotificationsAsReadHandler(INotificationRepository repo, IUnitOfWork uow)
    : IRequestHandler<MarkAllNotificationsAsReadCommand, Result>
{
    public async Task<Result> Handle(MarkAllNotificationsAsReadCommand command, CancellationToken ct)
    {
        await repo.MarkAllAsReadAsync(command.UserId, ct);
        return Result.Success();
    }
}
