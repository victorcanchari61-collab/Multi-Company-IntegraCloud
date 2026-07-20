namespace Backend.Application.ERP.DTOs.Ventas;

public sealed record QuotationDto(
    Guid Id, Guid CustomerId, string CustomerName, string QuotationNumber,
    DateTime IssueDate, DateTime? ValidUntil, string Status,
    decimal SubTotal, decimal Tax, decimal Total, string? Notes,
    List<QuotationItemDto> Items);

public sealed record QuotationItemDto(
    Guid Id, Guid ProductId, string ProductName, decimal Quantity,
    decimal UnitPrice, decimal SubTotal);

public sealed record CreateQuotationRequest(
    Guid CustomerId, DateTime? ValidUntil, string? Notes,
    List<CreateQuotationItemRequest> Items);

public sealed record CreateQuotationItemRequest(Guid ProductId, decimal Quantity, decimal UnitPrice);
