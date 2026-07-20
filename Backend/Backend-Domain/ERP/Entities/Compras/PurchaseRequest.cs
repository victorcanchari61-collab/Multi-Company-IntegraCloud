using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities.Compras;

public enum PurchaseRequestStatus
{
    Draft,
    Pending,
    Approved,
    Rejected,
    Ordered
}

public sealed class PurchaseRequest : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string RequestNumber { get; private set; } = null!;
    public string RequesterName { get; private set; } = null!;
    public string? Department { get; private set; }
    public DateTime RequestDate { get; private set; }
    public DateTime? ExpectedDate { get; private set; }
    public Guid? SupplierId { get; private set; }
    public Supplier? Supplier { get; private set; }
    public string? Priority { get; private set; }
    public PurchaseRequestStatus Status { get; private set; } = PurchaseRequestStatus.Draft;
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private readonly List<PurchaseRequestItem> _items = [];
    public IReadOnlyList<PurchaseRequestItem> Items => _items.AsReadOnly();

    private PurchaseRequest() { }

    public PurchaseRequest(Guid id, Guid companyId, string requestNumber,
        string requesterName, DateTime requestDate, Guid? supplierId = null,
        string? priority = null) : base(id)
    {
        CompanyId = companyId;
        RequestNumber = requestNumber;
        RequesterName = requesterName;
        RequestDate = requestDate;
        SupplierId = supplierId;
        Priority = priority;
    }

    public void AddItem(Guid productId, decimal quantity, string? description, decimal? estimatedPrice)
    {
        var item = new PurchaseRequestItem(Guid.NewGuid(), Id, productId, quantity, description, estimatedPrice);
        _items.Add(item);
    }

    public void Update(string requesterName, string? department, DateTime? expectedDate, string? notes,
        Guid? supplierId, string? priority,
        List<(Guid ProductId, decimal Quantity, string? Description, decimal? EstimatedPrice)> items)
    {
        RequesterName = requesterName;
        Department = department;
        ExpectedDate = expectedDate;
        Notes = notes;
        SupplierId = supplierId;
        Priority = priority;
        _items.Clear();
        foreach (var (productId, quantity, description, estimatedPrice) in items)
            _items.Add(new PurchaseRequestItem(Guid.NewGuid(), Id, productId, quantity, description, estimatedPrice));
    }

    public void Approve() { Status = PurchaseRequestStatus.Approved; }
    public void Reject() { Status = PurchaseRequestStatus.Rejected; }
    public void MarkOrdered() { Status = PurchaseRequestStatus.Ordered; }
}

public sealed class PurchaseRequestItem : AggregateRoot
{
    public Guid PurchaseRequestId { get; private set; }
    public Guid ProductId { get; private set; }
    public decimal Quantity { get; private set; }
    public string? Description { get; private set; }
    public decimal? EstimatedPrice { get; private set; }

    private PurchaseRequestItem() { }

    public PurchaseRequestItem(Guid id, Guid purchaseRequestId, Guid productId,
        decimal quantity, string? description, decimal? estimatedPrice) : base(id)
    {
        PurchaseRequestId = purchaseRequestId;
        ProductId = productId;
        Quantity = quantity;
        Description = description;
        EstimatedPrice = estimatedPrice;
    }
}
