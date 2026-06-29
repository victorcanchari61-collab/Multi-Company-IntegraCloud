namespace Backend.Application.ERP.DTOs;

public sealed record CategoryDto(Guid Id, string Name, string? Description, bool IsActive);
public sealed record SubcategoryDto(Guid Id, Guid CategoryId, string CategoryName, string Name, string? Description, bool IsActive);
public sealed record BrandDto(Guid Id, string Name, string? Description, bool IsActive);
public sealed record SubbrandDto(Guid Id, Guid BrandId, string BrandName, string Name, string? Description, bool IsActive);
public sealed record ProductDto(
    Guid Id, string Name, string? Description, string? TicketDescription, string? Sku, string? Barcode,
    Guid? CategoryId, string? CategoryName,
    Guid? SubcategoryId, string? SubcategoryName,
    Guid? BrandId, string? BrandName,
    Guid? SubbrandId, string? SubbrandName,
    Guid? UnitOfMeasureId, string? UnitOfMeasureName,
    decimal? SalePrice, decimal? CostPrice,
    decimal? StockMin, decimal? StockMax,
    string? LoteNumber, DateOnly? LoteExpiry,
    decimal? LoteStock, decimal? LoteStockFraction,
    string? TechnicalAction, bool IsActive);
public sealed record ProductPresentationDto(
    Guid Id, Guid ProductId, string Name,
    Guid? UnitOfMeasureId, string? UnitOfMeasureName,
    decimal Factor, bool IsBase, int SortOrder, bool IsActive,
    Guid? ComplementaryProductId, string? ComplementaryProductName,
    int ComplementaryQuantity, decimal MarkupPercentage);
public sealed record PriceListDto(Guid Id, string Name, string? Description, string Type, bool IsActive);
public sealed record CurrencyDto(Guid Id, string Code, string Name, string? Symbol, bool IsActive);
public sealed record ProductPriceDto(
    Guid Id, Guid ProductId, Guid PresentationId, string? PresentationName,
    Guid PriceListId, string? PriceListName,
    Guid CurrencyId, string? CurrencyCode,
    decimal? PurchasePrice, decimal? SalePrice);
public sealed record ProductLotDto(
    Guid Id, Guid ProductId, string Number, DateOnly? ExpiryDate, decimal InitialStock, DateTime CreatedAt);
