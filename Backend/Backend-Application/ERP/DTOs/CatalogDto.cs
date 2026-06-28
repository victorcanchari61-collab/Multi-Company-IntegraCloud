namespace Backend.Application.ERP.DTOs;

public sealed record CategoryDto(Guid Id, string Name, string? Description, bool IsActive);
public sealed record SubcategoryDto(Guid Id, Guid CategoryId, string CategoryName, string Name, string? Description, bool IsActive);
public sealed record BrandDto(Guid Id, string Name, string? Description, bool IsActive);
public sealed record SubbrandDto(Guid Id, Guid BrandId, string BrandName, string Name, string? Description, bool IsActive);
public sealed record ProductDto(
    Guid Id, string Name, string? Description, string? Sku, string? Barcode,
    Guid? CategoryId, string? CategoryName,
    Guid? SubcategoryId, string? SubcategoryName,
    Guid? BrandId, string? BrandName,
    Guid? SubbrandId, string? SubbrandName,
    Guid? UnitOfMeasureId, string? UnitOfMeasureName,
    decimal? SalePrice, decimal? CostPrice, bool IsActive);
