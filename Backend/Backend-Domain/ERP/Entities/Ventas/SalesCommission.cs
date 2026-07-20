using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities.Ventas;

public sealed class SalesCommission : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? SalesAgentName { get; private set; }
    public decimal CommissionRate { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private SalesCommission() { }

    public SalesCommission(Guid id, Guid companyId, string code, string name,
        string? salesAgentName = null, decimal commissionRate = 0) : base(id)
    {
        CompanyId = companyId;
        Code = code;
        Name = name;
        SalesAgentName = salesAgentName;
        CommissionRate = commissionRate;
    }

    public void Update(string code, string name, string? salesAgentName, decimal commissionRate)
    {
        Code = code;
        Name = name;
        SalesAgentName = salesAgentName;
        CommissionRate = commissionRate;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
