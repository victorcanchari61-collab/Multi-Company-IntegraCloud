using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class PriceList : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public string Type { get; private set; } = null!; // "purchase", "sale", "both"
    public bool IsActive { get; private set; } = true;

    private PriceList() { }

    public PriceList(Guid id, Guid companyId, string name, string? description, string type) : base(id)
    {
        CompanyId = companyId;
        Name = name;
        Description = description;
        Type = type;
    }

    public void Update(string name, string? description, string type)
    {
        Name = name;
        Description = description;
        Type = type;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
