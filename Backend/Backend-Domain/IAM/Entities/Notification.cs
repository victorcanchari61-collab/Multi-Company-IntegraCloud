using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class Notification : AggregateRoot
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public Guid CompanyId { get; private set; }
    public string Type { get; private set; } = null!;
    public string Title { get; private set; } = null!;
    public string Message { get; private set; } = null!;
    public string? ReferenceType { get; private set; }
    public string? ReferenceId { get; private set; }
    public bool IsRead { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; private set; }

    private Notification() { }

    public Notification(Guid id, Guid userId, Guid companyId, string type,
        string title, string message, string? referenceType = null, string? referenceId = null)
        : base(id)
    {
        UserId = userId;
        CompanyId = companyId;
        Type = type;
        Title = title;
        Message = message;
        ReferenceType = referenceType;
        ReferenceId = referenceId;
    }

    public void MarkAsRead()
    {
        IsRead = true;
        ReadAt = DateTime.UtcNow;
    }
}
