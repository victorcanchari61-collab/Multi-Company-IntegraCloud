namespace Backend.Application.ERP.DTOs.Compras;

public sealed record SupplierDto(
    Guid Id, string Code, string BusinessName, string? TradeName,
    string? Address, string? Phone, string? Email, string? ContactPerson,
    string? PaymentTerms, decimal? CreditLimit, bool IsActive);

public sealed record CreateSupplierRequest(
    string Code, string BusinessName, string? TradeName, string? Address,
    string? Phone, string? Email, string? ContactPerson,
    string? PaymentTerms, decimal? CreditLimit);

public sealed record UpdateSupplierRequest(
    string Code, string BusinessName, string? TradeName, string? Address,
    string? Phone, string? Email, string? ContactPerson,
    string? PaymentTerms, decimal? CreditLimit);
