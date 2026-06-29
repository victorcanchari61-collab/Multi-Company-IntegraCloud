using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class Product : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public string? TicketDescription { get; private set; }
    public string? Sku { get; private set; }
    public string? Barcode { get; private set; }
    public Guid? CategoryId { get; private set; }
    public Category? Category { get; private set; }
    public Guid? SubcategoryId { get; private set; }
    public Subcategory? Subcategory { get; private set; }
    public Guid? BrandId { get; private set; }
    public Brand? Brand { get; private set; }
    public Guid? SubbrandId { get; private set; }
    public Subbrand? Subbrand { get; private set; }
    public Guid? UnitOfMeasureId { get; private set; }
    public UnitOfMeasure? UnitOfMeasure { get; private set; }
    public decimal? SalePrice { get; private set; }
    public decimal? CostPrice { get; private set; }
    public decimal? StockMin { get; private set; }
    public decimal? StockMax { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public ICollection<ProductPresentation> Presentations { get; private set; } = [];
    public ICollection<ProductPrice> Prices { get; private set; } = [];
    public ICollection<ProductLot> Lots { get; private set; } = [];

    private Product() { }

    public Product(
        Guid id, Guid companyId, string name, string? description,
        string? ticketDescription, string? sku, string? barcode,
        Guid? categoryId, Guid? subcategoryId,
        Guid? brandId, Guid? subbrandId,
        Guid? unitOfMeasureId,
        decimal? salePrice, decimal? costPrice,
        decimal? stockMin, decimal? stockMax) : base(id)
    {
        CompanyId = companyId;
        Name = name;
        Description = description;
        TicketDescription = ticketDescription;
        Sku = sku;
        Barcode = barcode;
        CategoryId = categoryId;
        SubcategoryId = subcategoryId;
        BrandId = brandId;
        SubbrandId = subbrandId;
        UnitOfMeasureId = unitOfMeasureId;
        SalePrice = salePrice;
        CostPrice = costPrice;
        StockMin = stockMin;
        StockMax = stockMax;
    }

    public void Update(
        string name, string? description, string? ticketDescription,
        string? sku, string? barcode,
        Guid? categoryId, Guid? subcategoryId,
        Guid? brandId, Guid? subbrandId,
        Guid? unitOfMeasureId,
        decimal? salePrice, decimal? costPrice,
        decimal? stockMin, decimal? stockMax)
    {
        Name = name;
        Description = description;
        TicketDescription = ticketDescription;
        Sku = sku;
        Barcode = barcode;
        CategoryId = categoryId;
        SubcategoryId = subcategoryId;
        BrandId = brandId;
        SubbrandId = subbrandId;
        UnitOfMeasureId = unitOfMeasureId;
        SalePrice = salePrice;
        CostPrice = costPrice;
        StockMin = stockMin;
        StockMax = stockMax;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
