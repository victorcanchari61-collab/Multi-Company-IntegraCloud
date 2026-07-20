using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class PhysicalCount : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid WarehouseId { get; private set; }
    public Warehouse? Warehouse { get; private set; }
    public string Status { get; private set; } = "DRAFT";
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public Guid CreatedBy { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public Guid? CompletedBy { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public Guid? ApprovedBy { get; private set; }

    public ICollection<PhysicalCountLine> Lines { get; private set; } = [];

    private PhysicalCount() { }

    public PhysicalCount(Guid id, Guid companyId, Guid warehouseId, string? notes, Guid createdBy) : base(id)
    {
        CompanyId = companyId;
        WarehouseId = warehouseId;
        Notes = notes;
        CreatedBy = createdBy;
    }

    public void Start() { if (Status == "DRAFT") Status = "IN_PROGRESS"; }
    public void Complete(Guid userId) { Status = "COMPLETED"; CompletedAt = DateTime.UtcNow; CompletedBy = userId; }
    public void Cancel() { Status = "CANCELLED"; }

    public void Approve(Guid userId)
    {
        Status = "APPROVED";
        ApprovedAt = DateTime.UtcNow;
        ApprovedBy = userId;
    }
}
