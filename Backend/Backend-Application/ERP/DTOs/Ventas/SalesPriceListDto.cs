namespace Backend.Application.ERP.DTOs.Ventas;

public sealed record SalesPriceListDto(
    Guid Id, string Code, string Name, string? Currency,
    bool IsActive, List<SalesPriceListItemDto> Items);

public sealed record SalesPriceListItemDto(
    Guid Id, Guid ProductId, string ProductName, decimal UnitPrice);

public sealed record CreateSalesPriceListRequest(
    string Code, string Name, string? Currency,
    List<CreateSalesPriceListItemRequest> Items);

public sealed record CreateSalesPriceListItemRequest(Guid ProductId, decimal UnitPrice);

public sealed record UpdateSalesPriceListRequest(
    string Code, string Name, string? Currency,
    List<CreateSalesPriceListItemRequest> Items);
