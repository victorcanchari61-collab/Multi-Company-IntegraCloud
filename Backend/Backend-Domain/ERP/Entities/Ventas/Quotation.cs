using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities.Ventas;

public enum QuotationStatus
{
    Draft,
    Issued,
    Accepted,
    Rejected,
    Cancelled
}

public sealed class Quotation : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid CustomerId { get; private set; }
    public Customer? Customer { get; private set; }
    public string QuotationNumber { get; private set; } = null!;
    public DateTime IssueDate { get; private set; }
    public DateTime? ValidUntil { get; private set; }
    public QuotationStatus Status { get; private set; } = QuotationStatus.Draft;
    public decimal SubTotal { get; private set; }
    public decimal Tax { get; private set; }
    public decimal Total { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    private readonly List<QuotationItem> _items = [];
    public IReadOnlyList<QuotationItem> Items => _items.AsReadOnly();

    private Quotation() { }

    public Quotation(Guid id, Guid companyId, Guid customerId, string quotationNumber,
        DateTime issueDate, DateTime? validUntil = null) : base(id)
    {
        CompanyId = companyId;
        CustomerId = customerId;
        QuotationNumber = quotationNumber;
        IssueDate = issueDate;
        ValidUntil = validUntil;
    }

    public void AddItem(Guid productId, decimal quantity, decimal unitPrice)
    {
        var item = new QuotationItem(Guid.NewGuid(), Id, productId, quantity, unitPrice);
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
        if (Status != QuotationStatus.Draft) return;
        Status = QuotationStatus.Issued;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Accept()
    {
        if (Status != QuotationStatus.Issued) return;
        Status = QuotationStatus.Accepted;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject()
    {
        if (Status != QuotationStatus.Issued) return;
        Status = QuotationStatus.Rejected;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status == QuotationStatus.Accepted) return;
        Status = QuotationStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }

    private void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.SubTotal);
        Tax = SubTotal * 0.18m;
        Total = SubTotal + Tax;
    }
}

public sealed class QuotationItem : AggregateRoot
{
    public Guid QuotationId { get; private set; }
    public Guid ProductId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal SubTotal { get; private set; }

    private QuotationItem() { }

    public QuotationItem(Guid id, Guid quotationId, Guid productId, decimal quantity, decimal unitPrice) : base(id)
    {
        QuotationId = quotationId;
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
        SubTotal = quantity * unitPrice;
    }
}
