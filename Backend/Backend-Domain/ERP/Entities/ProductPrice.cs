using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class ProductPrice : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid ProductId { get; private set; }
    public Product? Product { get; private set; }
    public Guid PresentationId { get; private set; }
    public ProductPresentation? Presentation { get; private set; }
    public Guid PriceListId { get; private set; }
    public PriceList? PriceList { get; private set; }
    public Guid CurrencyId { get; private set; }
    public Currency? Currency { get; private set; }
    public decimal? PurchasePrice { get; private set; }
    public decimal? SalePrice { get; private set; }

    private ProductPrice() { }

    public ProductPrice(
        Guid id, Guid companyId, Guid productId,
        Guid presentationId, Guid priceListId, Guid currencyId,
        decimal? purchasePrice, decimal? salePrice) : base(id)
    {
        CompanyId = companyId;
        ProductId = productId;
        PresentationId = presentationId;
        PriceListId = priceListId;
        CurrencyId = currencyId;
        PurchasePrice = purchasePrice;
        SalePrice = salePrice;
    }

    public void UpdatePrices(decimal? purchasePrice, decimal? salePrice)
    {
        PurchasePrice = purchasePrice;
        SalePrice = salePrice;
    }
}
