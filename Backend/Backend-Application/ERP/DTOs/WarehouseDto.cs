namespace Backend.Application.ERP.DTOs;

public sealed record WarehouseDto(Guid Id, string Code, string Name, string? Type, string? Location, bool IsActive);
public sealed record WarehouseCreateDto(string Code, string Name, string? Type, string? Location);
public sealed record WarehouseUpdateDto(string Code, string Name, string? Type, string? Location);
