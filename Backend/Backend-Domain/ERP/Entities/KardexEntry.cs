using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class KardexEntry : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid ProductId { get; private set; }
    public Product? Product { get; private set; }
    public Guid WarehouseId { get; private set; }
    public Warehouse? Warehouse { get; private set; }
    public string MovementType { get; private set; } = null!;
    public string? ReferenceType { get; private set; }
    public Guid? ReferenceId { get; private set; }
    public decimal QuantityIn { get; private set; }
    public decimal QuantityOut { get; private set; }
    public decimal Balance { get; private set; }
    public decimal PreviousBalance { get; private set; }
    public decimal? UnitCost { get; private set; }
    public decimal? TotalCost { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public Guid CreatedBy { get; private set; }

    private KardexEntry() { }

    public KardexEntry(
        Guid id, Guid companyId, Guid productId, Guid warehouseId,
        string movementType, decimal quantityIn, decimal quantityOut,
        decimal balance, decimal previousBalance, decimal? unitCost, decimal? totalCost,
        string? referenceType, Guid? referenceId, string? notes, Guid createdBy) : base(id)
    {
        CompanyId = companyId;
        ProductId = productId;
        WarehouseId = warehouseId;
        MovementType = movementType;
        QuantityIn = quantityIn;
        QuantityOut = quantityOut;
        Balance = balance;
        PreviousBalance = previousBalance;
        UnitCost = unitCost;
        TotalCost = totalCost;
        ReferenceType = referenceType;
        ReferenceId = referenceId;
        Notes = notes;
        CreatedBy = createdBy;
    }
}
