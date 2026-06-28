using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class Subbrand : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid BrandId { get; private set; }
    public Brand Brand { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public ICollection<Product> Products { get; private set; } = [];

    private Subbrand() { }

    public Subbrand(Guid id, Guid companyId, Guid brandId, string name, string? description) : base(id)
    {
        CompanyId = companyId;
        BrandId = brandId;
        Name = name;
        Description = description;
    }

    public void Update(Guid brandId, string name, string? description)
    {
        BrandId = brandId;
        Name = name;
        Description = description;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
