using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class Company : AggregateRoot
{
    // Información básica
    public string Name { get; private set; } = null!;
    public string Slug { get; private set; } = null!;
    public string? LegalName { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public string? Website { get; private set; }
    public string? Address { get; private set; }

    // Facturación electrónica
    public string? TaxId { get; private set; }
    public string? TaxAddress { get; private set; }
    public string? EconomicActivity { get; private set; }
    public int TaxpayerType { get; private set; } = 1; // 1=Natural, 2=Jurídico
    public bool AccountingRequired { get; private set; }
    public string SettlementCurrency { get; private set; } = "PEN";

    // Estado y auditoría
    public int Status { get; private set; } = 1; // 1=Active, 2=Suspended
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public Guid? CreatedBy { get; private set; }

    public ICollection<User> Users { get; private set; } = [];
    public ICollection<Role> Roles { get; private set; } = [];
    public ICollection<CompanyModuleAccess> ModuleAccesses { get; private set; } = [];

    private Company() { }

    public Company(
        Guid id,
        string name,
        string slug,
        string? legalName,
        string? logoUrl,
        string? email,
        string? phone,
        string? website,
        string? address,
        string? taxId,
        string? taxAddress,
        string? economicActivity,
        int taxpayerType,
        bool accountingRequired,
        string settlementCurrency,
        Guid? createdBy)
        : base(id)
    {
        Name = name;
        Slug = slug;
        LegalName = legalName;
        LogoUrl = logoUrl;
        Email = email;
        Phone = phone;
        Website = website;
        Address = address;
        TaxId = taxId;
        TaxAddress = taxAddress;
        EconomicActivity = economicActivity;
        TaxpayerType = taxpayerType;
        AccountingRequired = accountingRequired;
        SettlementCurrency = settlementCurrency;
        CreatedBy = createdBy;
    }

    public void Suspend() => Status = 2;
    public void Activate() => Status = 1;

    /// <summary>Actualiza el perfil de la empresa, incluido el subdominio.</summary>
    public void Update(
        string name,
        string slug,
        string? legalName,
        string? logoUrl,
        string? email,
        string? phone,
        string? website,
        string? address,
        string? taxId,
        string? taxAddress,
        string? economicActivity,
        int taxpayerType,
        bool accountingRequired,
        string settlementCurrency)
    {
        Name = name;
        Slug = slug;
        LegalName = legalName;
        LogoUrl = logoUrl;
        Email = email;
        Phone = phone;
        Website = website;
        Address = address;
        TaxId = taxId;
        TaxAddress = taxAddress;
        EconomicActivity = economicActivity;
        TaxpayerType = taxpayerType;
        AccountingRequired = accountingRequired;
        SettlementCurrency = settlementCurrency;
    }
}
