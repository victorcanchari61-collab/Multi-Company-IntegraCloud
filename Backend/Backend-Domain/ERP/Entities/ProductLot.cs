using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities;

public sealed class ProductLot : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid ProductId { get; private set; }
    public Product? Product { get; private set; }
    public string Number { get; private set; } = null!;
    public DateOnly? ExpiryDate { get; private set; }
    public decimal InitialStock { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private ProductLot() { }

    public ProductLot(
        Guid id, Guid companyId, Guid productId,
        string number, DateOnly? expiryDate, decimal initialStock) : base(id)
    {
        CompanyId = companyId;
        ProductId = productId;
        Number = number;
        ExpiryDate = expiryDate;
        InitialStock = initialStock;
    }

    public void Update(string number, DateOnly? expiryDate, decimal initialStock)
    {
        Number = number;
        ExpiryDate = expiryDate;
        InitialStock = initialStock;
    }
}
