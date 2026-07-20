namespace Backend.Application.ERP.DTOs.Ventas;

public sealed record CommercialTermDto(
    Guid Id, string Code, string Name, string? Description,
    int PaymentDays, bool IsActive);

public sealed record CreateCommercialTermRequest(
    string Code, string Name, string? Description, int PaymentDays);

public sealed record UpdateCommercialTermRequest(
    string Code, string Name, string? Description, int PaymentDays);
