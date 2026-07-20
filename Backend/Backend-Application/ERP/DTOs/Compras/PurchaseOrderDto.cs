namespace Backend.Application.ERP.DTOs.Compras;

public sealed record PurchaseOrderDto(
    Guid Id, Guid SupplierId, string SupplierName, string OrderNumber,
    DateTime IssueDate, DateTime? ExpectedDate, string Status,
    decimal SubTotal, decimal Tax, decimal Total, string? Notes,
    List<PurchaseOrderItemDto> Items);

public sealed record PurchaseOrderItemDto(
    Guid Id, Guid ProductId, string ProductName, decimal Quantity,
    decimal UnitPrice, decimal SubTotal, decimal QuantityReceived = 0);

public sealed record CreatePurchaseOrderRequest(
    Guid SupplierId, DateTime? ExpectedDate, string? Notes,
    List<CreatePurchaseOrderItemRequest> Items);

public sealed record CreatePurchaseOrderItemRequest(Guid ProductId, decimal Quantity, decimal UnitPrice);

public sealed record UpdatePurchaseOrderRequest(
    DateTime? ExpectedDate, string? Notes,
    List<CreatePurchaseOrderItemRequest> Items);
