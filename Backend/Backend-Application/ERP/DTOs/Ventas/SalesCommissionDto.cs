namespace Backend.Application.ERP.DTOs.Ventas;

public sealed record SalesCommissionDto(
    Guid Id, string Code, string Name, string? SalesAgentName,
    decimal CommissionRate, bool IsActive);

public sealed record CreateSalesCommissionRequest(
    string Code, string Name, string? SalesAgentName, decimal CommissionRate);

public sealed record UpdateSalesCommissionRequest(
    string Code, string Name, string? SalesAgentName, decimal CommissionRate);
