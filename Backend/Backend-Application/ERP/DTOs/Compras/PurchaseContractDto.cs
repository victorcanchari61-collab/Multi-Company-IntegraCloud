namespace Backend.Application.ERP.DTOs.Compras;

public sealed record PurchaseContractDto(
    Guid Id, Guid SupplierId, string SupplierName,
    string ContractNumber, string Title,
    DateTime StartDate, DateTime EndDate,
    decimal? Value, string? Terms, bool IsActive);

public sealed record CreatePurchaseContractRequest(
    Guid SupplierId, string ContractNumber, string Title,
    DateTime StartDate, DateTime EndDate,
    decimal? Value, string? Terms);

public sealed record UpdatePurchaseContractRequest(
    string Title, DateTime StartDate, DateTime EndDate,
    decimal? Value, string? Terms);
