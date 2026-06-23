using Backend.SharedKernel;

namespace Backend.Domain.IAM.Events;

public sealed class UserProvisionedEvent : DomainEvent
{
    public Guid UserId { get; }
    public Guid CompanyId { get; }

    public UserProvisionedEvent(Guid userId, Guid companyId)
    {
        UserId = userId;
        CompanyId = companyId;
    }
}
