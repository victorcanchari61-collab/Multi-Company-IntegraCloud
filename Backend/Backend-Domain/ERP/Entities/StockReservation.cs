using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class StockReservation : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid ProductId { get; private set; }
    public Product? Product { get; private set; }
    public Guid WarehouseId { get; private set; }
    public Warehouse? Warehouse { get; private set; }
    public decimal Quantity { get; private set; }
    public string? ReferenceType { get; private set; }
    public Guid? ReferenceId { get; private set; }
    public string Status { get; private set; } = "ACTIVE";
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public Guid CreatedBy { get; private set; }
    public DateTime? ReleasedAt { get; private set; }

    private StockReservation() { }

    public StockReservation(Guid id, Guid companyId, Guid productId, Guid warehouseId,
        decimal quantity, string? referenceType, Guid? referenceId, string? notes, Guid createdBy) : base(id)
    {
        CompanyId = companyId;
        ProductId = productId;
        WarehouseId = warehouseId;
        Quantity = quantity;
        ReferenceType = referenceType;
        ReferenceId = referenceId;
        Notes = notes;
        CreatedBy = createdBy;
    }

    public void Release()
    {
        Status = "RELEASED";
        ReleasedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        Status = "CANCELLED";
    }
}
