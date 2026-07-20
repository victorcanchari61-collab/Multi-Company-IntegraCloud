using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class Subcategory : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid CategoryId { get; private set; }
    public Category Category { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public ICollection<Product> Products { get; private set; } = [];

    private Subcategory() { }

    public Subcategory(Guid id, Guid companyId, Guid categoryId, string name, string? description) : base(id)
    {
        CompanyId = companyId;
        CategoryId = categoryId;
        Name = name;
        Description = description;
    }

    public void Update(Guid categoryId, string name, string? description)
    {
        CategoryId = categoryId;
        Name = name;
        Description = description;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
