using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class Location : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid WarehouseId { get; private set; }
    public Warehouse? Warehouse { get; private set; }
    public string Code { get; private set; } = null!;
    public string? Description { get; private set; }
    public string? Zone { get; private set; }
    public Guid? ParentId { get; private set; }
    public Location? Parent { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private Location() { }

    public Location(Guid id, Guid companyId, Guid warehouseId, string code, string? description, string? zone, Guid? parentId) : base(id)
    {
        CompanyId = companyId;
        WarehouseId = warehouseId;
        Code = code;
        Description = description;
        Zone = zone;
        ParentId = parentId;
    }

    public void Update(string code, string? description, string? zone, Guid? parentId)
    {
        Code = code;
        Description = description;
        Zone = zone;
        ParentId = parentId;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
