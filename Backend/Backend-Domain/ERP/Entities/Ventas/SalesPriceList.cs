using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities.Ventas;

public sealed class SalesPriceList : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Currency { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private readonly List<SalesPriceListItem> _items = [];
    public IReadOnlyList<SalesPriceListItem> Items => _items.AsReadOnly();

    private SalesPriceList() { }

    public SalesPriceList(Guid id, Guid companyId, string code, string name, string? currency = null) : base(id)
    {
        CompanyId = companyId;
        Code = code;
        Name = name;
        Currency = currency;
    }

    public void Update(string code, string name, string? currency)
    {
        Code = code;
        Name = name;
        Currency = currency;
    }

    public void AddItem(Guid productId, decimal unitPrice)
    {
        _items.RemoveAll(i => i.ProductId == productId);
        _items.Add(new SalesPriceListItem(Guid.NewGuid(), Id, productId, unitPrice));
    }

    public void RemoveItem(Guid itemId) => _items.RemoveAll(i => i.Id == itemId);
    public void ClearItems() => _items.Clear();
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

public sealed class SalesPriceListItem : AggregateRoot
{
    public Guid SalesPriceListId { get; private set; }
    public Guid ProductId { get; private set; }
    public decimal UnitPrice { get; private set; }

    private SalesPriceListItem() { }

    public SalesPriceListItem(Guid id, Guid salesPriceListId, Guid productId, decimal unitPrice) : base(id)
    {
        SalesPriceListId = salesPriceListId;
        ProductId = productId;
        UnitPrice = unitPrice;
    }
}
