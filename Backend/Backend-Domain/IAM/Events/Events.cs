using Backend.SharedKernel;

namespace Backend.Domain.IAM.Events;

public sealed class CompanyCreatedEvent : DomainEvent
{
    public Guid CompanyId { get; }
    public string CompanyName { get; }

    public CompanyCreatedEvent(Guid companyId, string companyName)
    {
        CompanyId = companyId;
        CompanyName = companyName;
    }
}

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

public sealed class RolePermissionsChangedEvent : DomainEvent
{
    public Guid RoleId { get; }
    public Guid CompanyId { get; }

    public RolePermissionsChangedEvent(Guid roleId, Guid companyId)
    {
        RoleId = roleId;
        CompanyId = companyId;
    }
}
