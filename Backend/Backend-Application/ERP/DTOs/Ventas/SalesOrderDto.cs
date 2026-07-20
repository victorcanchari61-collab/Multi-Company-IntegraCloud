namespace Backend.Application.ERP.DTOs.Ventas;

public sealed record SalesOrderDto(
    Guid Id, Guid CustomerId, string CustomerName, string OrderNumber,
    DateTime IssueDate, DateTime? DeliveryDate, string Status,
    decimal SubTotal, decimal Tax, decimal Total, string? Notes,
    List<SalesOrderItemDto> Items);

public sealed record SalesOrderItemDto(
    Guid Id, Guid ProductId, string ProductName, decimal Quantity,
    decimal UnitPrice, decimal SubTotal);

public sealed record CreateSalesOrderRequest(
    Guid CustomerId, DateTime? DeliveryDate, string? Notes,
    List<CreateSalesOrderItemRequest> Items);

public sealed record CreateSalesOrderItemRequest(Guid ProductId, decimal Quantity, decimal UnitPrice);
