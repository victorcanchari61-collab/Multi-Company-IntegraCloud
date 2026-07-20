using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class SerialNumber : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid ProductId { get; private set; }
    public Product? Product { get; private set; }
    public Guid? BatchId { get; private set; }
    public ProductLot? Batch { get; private set; }
    public string Serial { get; private set; } = null!;
    public string Status { get; private set; } = "IN_STOCK";
    public Guid WarehouseId { get; private set; }
    public Warehouse? Warehouse { get; private set; }
    public Guid? LocationId { get; private set; }
    public Location? Location { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private SerialNumber() { }

    public SerialNumber(Guid id, Guid companyId, Guid productId, Guid? batchId,
        string serial, Guid warehouseId, Guid? locationId) : base(id)
    {
        CompanyId = companyId;
        ProductId = productId;
        BatchId = batchId;
        Serial = serial;
        WarehouseId = warehouseId;
        LocationId = locationId;
    }

    public void MarkSold() => Status = "SOLD";
    public void MarkReturned() => Status = "RETURNED";
    public void MarkScrapped() => Status = "SCRAPPED";
}
