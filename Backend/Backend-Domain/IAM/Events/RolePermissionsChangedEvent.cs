using Backend.SharedKernel;

namespace Backend.Domain.IAM.Events;

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
