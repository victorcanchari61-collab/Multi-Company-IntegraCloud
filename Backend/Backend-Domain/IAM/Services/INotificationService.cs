namespace Backend.Domain.IAM.Services;

public interface INotificationService
{
    Task NotifyAsync(Guid userId, Guid companyId, string type, string title, string message,
        string? referenceType = null, string? referenceId = null, CancellationToken ct = default);
    Task NotifyMultipleAsync(IEnumerable<Guid> userIds, Guid companyId, string type, string title, string message,
        string? referenceType = null, string? referenceId = null, CancellationToken ct = default);
}
