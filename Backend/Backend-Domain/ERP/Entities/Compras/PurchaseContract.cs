using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities.Compras;

public sealed class PurchaseContract : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public Guid SupplierId { get; private set; }
    public Supplier? Supplier { get; private set; }
    public string ContractNumber { get; private set; } = null!;
    public string Title { get; private set; } = null!;
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public decimal? Value { get; private set; }
    public string? Terms { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private PurchaseContract() { }

    public PurchaseContract(Guid id, Guid companyId, Guid supplierId,
        string contractNumber, string title, DateTime startDate, DateTime endDate) : base(id)
    {
        CompanyId = companyId;
        SupplierId = supplierId;
        ContractNumber = contractNumber;
        Title = title;
        StartDate = startDate;
        EndDate = endDate;
    }

    public void Update(string title, DateTime startDate, DateTime endDate,
        decimal? value, string? terms)
    {
        Title = title;
        StartDate = startDate;
        EndDate = endDate;
        Value = value;
        Terms = terms;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
