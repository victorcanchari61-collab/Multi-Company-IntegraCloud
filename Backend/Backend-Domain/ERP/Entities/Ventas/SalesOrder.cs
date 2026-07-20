using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities.Ventas;

public enum SalesOrderStatus
{
    Draft,
    Issued,
    Confirmed,
    Shipped,
    Delivered,
    Cancelled
}

public sealed class SalesOrder : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid CustomerId { get; private set; }
    public Customer? Customer { get; private set; }
    public string OrderNumber { get; private set; } = null!;
    public DateTime IssueDate { get; private set; }
    public DateTime? DeliveryDate { get; private set; }
    public SalesOrderStatus Status { get; private set; } = SalesOrderStatus.Draft;
    public decimal SubTotal { get; private set; }
    public decimal Tax { get; private set; }
    public decimal Total { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    private readonly List<SalesOrderItem> _items = [];
    public IReadOnlyList<SalesOrderItem> Items => _items.AsReadOnly();

    private SalesOrder() { }

    public SalesOrder(Guid id, Guid companyId, Guid customerId, string orderNumber,
        DateTime issueDate, DateTime? deliveryDate = null) : base(id)
    {
        CompanyId = companyId;
        CustomerId = customerId;
        OrderNumber = orderNumber;
        IssueDate = issueDate;
        DeliveryDate = deliveryDate;
    }

    public void AddItem(Guid productId, decimal quantity, decimal unitPrice)
    {
        var item = new SalesOrderItem(Guid.NewGuid(), Id, productId, quantity, unitPrice);
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
        if (Status != SalesOrderStatus.Draft) return;
        Status = SalesOrderStatus.Issued;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Confirm()
    {
        if (Status != SalesOrderStatus.Issued) return;
        Status = SalesOrderStatus.Confirmed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Ship()
    {
        if (Status != SalesOrderStatus.Confirmed) return;
        Status = SalesOrderStatus.Shipped;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deliver()
    {
        if (Status != SalesOrderStatus.Shipped) return;
        Status = SalesOrderStatus.Delivered;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == SalesOrderStatus.Delivered) return;
        Status = SalesOrderStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    private void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.SubTotal);
        Tax = SubTotal * 0.18m;
        Total = SubTotal + Tax;
    }
}

public sealed class SalesOrderItem : AggregateRoot
{
    public Guid SalesOrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal SubTotal { get; private set; }

    private SalesOrderItem() { }

    public SalesOrderItem(Guid id, Guid salesOrderId, Guid productId, decimal quantity, decimal unitPrice) : base(id)
    {
        SalesOrderId = salesOrderId;
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
        SubTotal = quantity * unitPrice;
    }
}
