using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class StockMovement : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid ProductId { get; private set; }
    public Product? Product { get; private set; }
    public Guid WarehouseId { get; private set; }
    public Warehouse? Warehouse { get; private set; }
    public Guid? TargetWarehouseId { get; private set; }
    public Warehouse? TargetWarehouse { get; private set; }
    public string MovementType { get; private set; } = null!;
    public decimal Quantity { get; private set; }
    public decimal? UnitCost { get; private set; }
    public string? ReferenceType { get; private set; }
    public Guid? ReferenceId { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public Guid CreatedBy { get; private set; }

    private StockMovement() { }

    public StockMovement(
        Guid id, Guid companyId, Guid productId, Guid warehouseId,
        string movementType, decimal quantity, decimal? unitCost,
        string? referenceType, Guid? referenceId, string? notes, Guid createdBy,
        Guid? targetWarehouseId = null) : base(id)
    {
        CompanyId = companyId;
        ProductId = productId;
        WarehouseId = warehouseId;
        MovementType = movementType;
        Quantity = quantity;
        UnitCost = unitCost;
        ReferenceType = referenceType;
        ReferenceId = referenceId;
        Notes = notes;
        CreatedBy = createdBy;
        TargetWarehouseId = targetWarehouseId;
    }
}
