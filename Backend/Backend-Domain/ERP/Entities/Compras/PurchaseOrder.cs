using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities.Compras;

public enum PurchaseOrderStatus
{
    Draft,
    Issued,
    Partial,
    Received,
    Closed,
    Cancelled
}

public sealed class PurchaseOrder : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid SupplierId { get; private set; }
    public Supplier? Supplier { get; private set; }
    public string OrderNumber { get; private set; } = null!;
    public DateTime IssueDate { get; private set; }
    public DateTime? ExpectedDate { get; private set; }
    public PurchaseOrderStatus Status { get; private set; } = PurchaseOrderStatus.Draft;
    public decimal SubTotal { get; private set; }
    public decimal Tax { get; private set; }
    public decimal Total { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    private readonly List<PurchaseOrderItem> _items = [];
    public IReadOnlyList<PurchaseOrderItem> Items => _items.AsReadOnly();

    private PurchaseOrder() { }

    public PurchaseOrder(Guid id, Guid companyId, Guid supplierId, string orderNumber,
        DateTime issueDate, DateTime? expectedDate) : base(id)
    {
        CompanyId = companyId;
        SupplierId = supplierId;
        OrderNumber = orderNumber;
        IssueDate = issueDate;
        ExpectedDate = expectedDate;
    }

    public void AddItem(Guid productId, decimal quantity, decimal unitPrice)
    {
        var item = new PurchaseOrderItem(Guid.NewGuid(), Id, productId, quantity, unitPrice);
        _items.Add(item);
        RecalculateTotals();
    }

    public void RemoveItem(Guid itemId)
    {
        _items.RemoveAll(i => i.Id == itemId);
        RecalculateTotals();
    }

    public void ClearItems()
    {
        _items.Clear();
        RecalculateTotals();
    }

    public void Issue()
    {
        if (Status != PurchaseOrderStatus.Draft) return;
        Status = PurchaseOrderStatus.Issued;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Receive(List<(Guid ProductId, decimal Quantity)> receivedItems)
    {
        if (Status != PurchaseOrderStatus.Issued && Status != PurchaseOrderStatus.Partial) return;

        foreach (var (productId, qty) in receivedItems)
        {
            var item = _items.FirstOrDefault(i => i.ProductId == productId);
            item?.Receive(qty);
        }

        var allFullyReceived = _items.All(i => i.QuantityReceived >= i.Quantity);
        var anyReceived = _items.Any(i => i.QuantityReceived > 0);
        Status = allFullyReceived ? PurchaseOrderStatus.Received
               : anyReceived ? PurchaseOrderStatus.Partial
               : PurchaseOrderStatus.Issued;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Close()
    {
        if (Status != PurchaseOrderStatus.Received) return;
        Status = PurchaseOrderStatus.Closed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == PurchaseOrderStatus.Received || Status == PurchaseOrderStatus.Closed) return;
        Status = PurchaseOrderStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Update(DateTime? expectedDate, string? notes, List<(Guid ProductId, decimal Quantity, decimal UnitPrice)> items)
    {
        ExpectedDate = expectedDate;
        Notes = notes;
        _items.Clear();
        foreach (var (productId, quantity, unitPrice) in items)
            _items.Add(new PurchaseOrderItem(Guid.NewGuid(), Id, productId, quantity, unitPrice));
        RecalculateTotals();
        UpdatedAt = DateTime.UtcNow;
    }

    private void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.SubTotal);
        Tax = SubTotal * 0.18m;
        Total = SubTotal + Tax;
    }
}

public sealed class PurchaseOrderItem : AggregateRoot
{
    public Guid PurchaseOrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal SubTotal { get; private set; }
    public decimal QuantityReceived { get; private set; }

    private PurchaseOrderItem() { }

    public PurchaseOrderItem(Guid id, Guid purchaseOrderId, Guid productId, decimal quantity, decimal unitPrice) : base(id)
    {
        PurchaseOrderId = purchaseOrderId;
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
        SubTotal = quantity * unitPrice;
    }

    public void Receive(decimal quantity)
    {
        QuantityReceived = Math.Min(Quantity, Math.Max(0, QuantityReceived + quantity));
    }
}
