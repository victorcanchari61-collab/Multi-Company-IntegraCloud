namespace Backend.Application.ERP.DTOs.Compras;

public sealed record PurchaseRequestDto(
    Guid Id, string RequestNumber, string RequesterName, string? Department,
    DateTime RequestDate, DateTime? ExpectedDate, Guid? SupplierId, string? SupplierName,
    string? Priority, string Status, string? Notes,
    List<PurchaseRequestItemDto> Items);

public sealed record PurchaseRequestItemDto(
    Guid Id, Guid ProductId, string ProductName, decimal Quantity,
    string? Description, decimal? EstimatedPrice);

public sealed record CreatePurchaseRequestRequest(
    string RequesterName, string? Department, DateTime? ExpectedDate, string? Notes,
    Guid? SupplierId, string? Priority,
    List<CreatePurchaseRequestItemRequest> Items);

public sealed record CreatePurchaseRequestItemRequest(Guid ProductId, decimal Quantity, string? Description, decimal? EstimatedPrice);

public sealed record UpdatePurchaseRequestRequest(
    string RequesterName, string? Department, DateTime? ExpectedDate, string? Notes,
    Guid? SupplierId, string? Priority,
    List<CreatePurchaseRequestItemRequest> Items);
