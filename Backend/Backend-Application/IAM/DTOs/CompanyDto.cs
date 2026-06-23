namespace Backend.Application.IAM.DTOs;

public sealed record CompanyDto(
    Guid Id,
    string Name,
    string Slug,
    string? LegalName,
    string? LogoUrl,
    string? Email,
    string? Phone,
    string? Website,
    string? Address,
    string? TaxId,
    string? TaxAddress,
    string? EconomicActivity,
    int TaxpayerType,
    bool AccountingRequired,
    string SettlementCurrency,
    int Status,
    DateTime CreatedAt
);
