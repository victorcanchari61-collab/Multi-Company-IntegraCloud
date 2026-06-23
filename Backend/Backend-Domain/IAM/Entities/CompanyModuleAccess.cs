using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class CompanyModuleAccess : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    public Guid ModuleId { get; private set; }
    public Module Module { get; private set; } = null!;
    public DateTime GrantedAt { get; private set; } = DateTime.UtcNow;
    public Guid? GrantedBy { get; private set; }

    private CompanyModuleAccess() { }

    public CompanyModuleAccess(Guid id, Guid companyId, Guid moduleId, Guid? grantedBy)
        : base(id)
    {
        CompanyId = companyId;
        ModuleId = moduleId;
        GrantedBy = grantedBy;
    }
}
