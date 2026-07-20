using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class PhysicalCountLine : Entity
{
    public Guid PhysicalCountId { get; private set; }
    public PhysicalCount? PhysicalCount { get; private set; }
    public Guid ProductId { get; private set; }
    public Product? Product { get; private set; }
    public decimal ExpectedQuantity { get; private set; }
    public decimal? CountedQuantity { get; private set; }
    public decimal Difference => (CountedQuantity ?? 0) - ExpectedQuantity;
    public string? Notes { get; private set; }
    public string Status { get; private set; } = "PENDING";

    private PhysicalCountLine() { }

    public PhysicalCountLine(Guid id, Guid physicalCountId, Guid productId, decimal expectedQuantity, string? notes) : base(id)
    {
        PhysicalCountId = physicalCountId;
        ProductId = productId;
        ExpectedQuantity = expectedQuantity;
        Notes = notes;
    }

    public void RecordCount(decimal countedQuantity, string? notes)
    {
        CountedQuantity = countedQuantity;
        Notes = notes ?? Notes;
        Status = "COUNTED";
    }
}
