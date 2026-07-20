namespace Backend.Application.ERP.DTOs.Compras;

public sealed record SupplierEvaluationDto(
    Guid Id, Guid SupplierId, string SupplierName,
    DateTime EvaluationDate, int Score, string EvaluatedBy,
    decimal? PriceRating, decimal? QualityRating, decimal? DeliveryRating,
    decimal? ServiceRating, string? Comments, Guid? OrderId = null);

public sealed record CreateSupplierEvaluationRequest(
    Guid SupplierId, DateTime EvaluationDate, int Score, string EvaluatedBy,
    decimal? PriceRating, decimal? QualityRating, decimal? DeliveryRating,
    decimal? ServiceRating, string? Comments, Guid? OrderId = null);

public sealed record UpdateSupplierEvaluationRequest(
    int Score, decimal? PriceRating, decimal? QualityRating,
    decimal? DeliveryRating, decimal? ServiceRating, string? Comments);
