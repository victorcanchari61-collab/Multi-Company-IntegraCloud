using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class ProductPresentation : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid ProductId { get; private set; }
    public Product? Product { get; private set; }
    public string Name { get; private set; } = null!;
    public Guid? UnitOfMeasureId { get; private set; }
    public UnitOfMeasure? UnitOfMeasure { get; private set; }
    public decimal Factor { get; private set; }
    public bool IsBase { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    private ProductPresentation() { }

    public ProductPresentation(
        Guid id, Guid companyId, Guid productId,
        string name, Guid? unitOfMeasureId, decimal factor,
        bool isBase, int sortOrder) : base(id)
    {
        CompanyId = companyId;
        ProductId = productId;
        Name = name;
        UnitOfMeasureId = unitOfMeasureId;
        Factor = factor;
        IsBase = isBase;
        SortOrder = sortOrder;
    }

    public void Update(string name, Guid? unitOfMeasureId, decimal factor, bool isBase, int sortOrder)
    {
        Name = name;
        UnitOfMeasureId = unitOfMeasureId;
        Factor = factor;
        IsBase = isBase;
        SortOrder = sortOrder;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
