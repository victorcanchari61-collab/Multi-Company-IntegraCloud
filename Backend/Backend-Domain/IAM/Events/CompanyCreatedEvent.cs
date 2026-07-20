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
