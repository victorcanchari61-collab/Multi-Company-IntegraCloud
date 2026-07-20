namespace Backend.Application.ERP.DTOs.Ventas;

public sealed record CustomerDto(
    Guid Id, string Code, string BusinessName, string? TradeName,
    string? TaxId, string? Address, string? Phone, string? Email,
    string? ContactPerson, decimal? CreditLimit, bool IsActive);

public sealed record CreateCustomerRequest(
    string Code, string BusinessName, string? TradeName, string? TaxId,
    string? Address, string? Phone, string? Email, string? ContactPerson,
    decimal? CreditLimit);

public sealed record UpdateCustomerRequest(
    string Code, string BusinessName, string? TradeName, string? TaxId,
    string? Address, string? Phone, string? Email, string? ContactPerson,
    decimal? CreditLimit);
