using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class Stock : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid ProductId { get; private set; }
    public Product? Product { get; private set; }
    public Guid WarehouseId { get; private set; }
    public Warehouse? Warehouse { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal ReservedQuantity { get; private set; }
    public decimal? UnitCost { get; private set; }
    public decimal? MinStock { get; private set; }
    public decimal? MaxStock { get; private set; }
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    public decimal Available => Quantity - ReservedQuantity;

    private Stock() { }

    public Stock(Guid id, Guid companyId, Guid productId, Guid warehouseId, decimal quantity) : base(id)
    {
        CompanyId = companyId;
        ProductId = productId;
        WarehouseId = warehouseId;
        Quantity = quantity;
    }

    public void SetCost(decimal unitCost)
    {
        UnitCost = unitCost;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetLevels(decimal? minStock, decimal? maxStock)
    {
        MinStock = minStock;
        MaxStock = maxStock;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecalculateAverageCost(decimal incomingQty, decimal incomingUnitCost)
    {
        var currentValue = (Quantity - incomingQty) * (UnitCost ?? 0);
        var incomingValue = incomingQty * incomingUnitCost;
        var newQty = Quantity;
        UnitCost = newQty > 0
            ? Math.Round((currentValue + incomingValue) / newQty, 4)
            : incomingUnitCost;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Increase(decimal amount)
    {
        Quantity += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Decrease(decimal amount)
    {
        Quantity -= amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reserve(decimal amount)
    {
        ReservedQuantity += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Unreserve(decimal amount)
    {
        ReservedQuantity -= amount;
        UpdatedAt = DateTime.UtcNow;
    }
}
