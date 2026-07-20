using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

/// <summary>Acceso (licencia) de una empresa a un SISTEMA completo. Nivel 1 del licenciamiento.</summary>
public sealed class CompanySystemAccess : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid SystemId { get; private set; }
    public DateTime GrantedAt { get; private set; } = DateTime.UtcNow;
    public Guid? GrantedBy { get; private set; }

    private CompanySystemAccess() { }

    public CompanySystemAccess(Guid id, Guid companyId, Guid systemId, Guid? grantedBy) : base(id)
    {
        CompanyId = companyId;
        SystemId = systemId;
        GrantedBy = grantedBy;
    }
}
