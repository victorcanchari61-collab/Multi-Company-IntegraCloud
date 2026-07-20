using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class Transfer : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid FromWarehouseId { get; private set; }
    public Warehouse? FromWarehouse { get; private set; }
    public Guid ToWarehouseId { get; private set; }
    public Warehouse? ToWarehouse { get; private set; }
    public string Status { get; private set; } = "PENDING";
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public Guid CreatedBy { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public Guid? CompletedBy { get; private set; }

    public ICollection<TransferItem> Items { get; private set; } = [];

    private Transfer() { }

    public Transfer(Guid id, Guid companyId, Guid fromWarehouseId, Guid toWarehouseId, string? notes, Guid createdBy) : base(id)
    {
        CompanyId = companyId;
        FromWarehouseId = fromWarehouseId;
        ToWarehouseId = toWarehouseId;
        Notes = notes;
        CreatedBy = createdBy;
    }

    public void Complete(Guid userId)
    {
        Status = "COMPLETED";
        CompletedAt = DateTime.UtcNow;
        CompletedBy = userId;
    }

    public void Cancel()
    {
        Status = "CANCELLED";
    }
}
