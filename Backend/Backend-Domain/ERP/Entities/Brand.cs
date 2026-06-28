using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class Brand : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public ICollection<Subbrand> Subbrands { get; private set; } = [];
    public ICollection<Product> Products { get; private set; } = [];

    private Brand() { }

    public Brand(Guid id, Guid companyId, string name, string? description) : base(id)
    {
        CompanyId = companyId;
        Name = name;
        Description = description;
    }

    public void Update(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
