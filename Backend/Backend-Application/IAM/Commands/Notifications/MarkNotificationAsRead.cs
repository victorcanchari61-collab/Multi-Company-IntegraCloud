using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Notifications;

public sealed record MarkNotificationAsReadCommand(Guid NotificationId) : IRequest<Result>;

internal sealed class MarkNotificationAsReadHandler(INotificationRepository repo, IUnitOfWork uow)
    : IRequestHandler<MarkNotificationAsReadCommand, Result>
{
    public async Task<Result> Handle(MarkNotificationAsReadCommand command, CancellationToken ct)
    {
        var notification = await repo.GetByIdAsync(command.NotificationId, ct);
        if (notification is null)
            return Result.Failure(Error.NotFound("notification.not_found", "Notificación no encontrada"));

        notification.MarkAsRead();
        repo.Update(notification);
        await uow.SaveChangesAsync(ct);

        return Result.Success();
    }
}
