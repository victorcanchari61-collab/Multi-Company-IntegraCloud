using Backend.SharedKernel;

namespace Backend.Domain.ERP.Entities.Ventas;

public sealed class Customer : AggregateRoot
{
    public Guid CompanyId { get; private set; }
    public string Code { get; private set; } = null!;
    public string BusinessName { get; private set; } = null!;
    public string? TradeName { get; private set; }
    public string? TaxId { get; private set; }
    public string? Address { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public string? ContactPerson { get; private set; }
    public decimal? CreditLimit { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private Customer() { }

    public Customer(Guid id, Guid companyId, string code, string businessName,
        string? tradeName = null, string? taxId = null, string? address = null,
        string? phone = null, string? email = null, string? contactPerson = null,
        decimal? creditLimit = null) : base(id)
    {
        CompanyId = companyId;
        Code = code;
        BusinessName = businessName;
        TradeName = tradeName;
        TaxId = taxId;
        Address = address;
        Phone = phone;
        Email = email;
        ContactPerson = contactPerson;
        CreditLimit = creditLimit;
    }

    public void Update(string code, string businessName, string? tradeName, string? taxId,
        string? address, string? phone, string? email, string? contactPerson, decimal? creditLimit)
    {
        Code = code;
        BusinessName = businessName;
        TradeName = tradeName;
        TaxId = taxId;
        Address = address;
        Phone = phone;
        Email = email;
        ContactPerson = contactPerson;
        CreditLimit = creditLimit;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
