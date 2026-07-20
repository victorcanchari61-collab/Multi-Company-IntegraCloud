namespace Backend.Application.ERP.DTOs;

public sealed record StockDto(
    Guid Id, Guid ProductId, string ProductName, string? ProductSku,
    Guid WarehouseId, string WarehouseName,
    decimal Quantity, decimal ReservedQuantity, decimal Available,
    decimal? UnitCost, decimal? MinStock, decimal? MaxStock);

public sealed record StockValuationDto(
    Guid Id, Guid ProductId, string ProductName, string? ProductSku,
    Guid WarehouseId, string WarehouseName,
    decimal Quantity, decimal? UnitCost, decimal TotalValue);

public sealed record StockMovementDto(
    Guid Id, Guid ProductId, string ProductName, string? ProductSku,
    Guid WarehouseId, string WarehouseName,
    string MovementType, decimal Quantity, decimal? UnitCost,
    string? ReferenceType, Guid? ReferenceId, string? Notes, DateTime CreatedAt);

public sealed record CreateStockMovementCommand(
    Guid ProductId, Guid WarehouseId, string MovementType,
    decimal Quantity, decimal? UnitCost, string? ReferenceType,
    Guid? ReferenceId, string? Notes);

public sealed record LocationDto(
    Guid Id, Guid WarehouseId, string WarehouseName, string Code, string? Description,
    string? Zone, Guid? ParentId, string? ParentCode, bool IsActive);

public sealed record CreateLocationCommand(Guid WarehouseId, string Code, string? Description, string? Zone, Guid? ParentId);

public sealed record UpdateLocationCommand(string Code, string? Description, string? Zone, Guid? ParentId);

public sealed record StockReservationDto(
    Guid Id, Guid ProductId, string ProductName, string? ProductSku,
    Guid WarehouseId, string WarehouseName,
    decimal Quantity, string Status, string? ReferenceType, Guid? ReferenceId,
    string? Notes, DateTime CreatedAt);

public sealed record CreateReservationCommand(
    Guid ProductId, Guid WarehouseId, decimal Quantity,
    string? ReferenceType, Guid? ReferenceId, string? Notes);

public sealed record ReleaseReservationCommand(Guid Id);

public sealed record SerialNumberDto(
    Guid Id, Guid ProductId, string ProductName, string? ProductSku,
    Guid? BatchId, string? BatchNumber, string Serial, string Status,
    Guid WarehouseId, string WarehouseName, Guid? LocationId);

public sealed record RegisterSerialCommand(
    Guid ProductId, Guid? BatchId, string Serial,
    Guid WarehouseId, Guid? LocationId);

public sealed record UpdateSerialStatusCommand(string Status);

public sealed record PhysicalCountDto(
    Guid Id, Guid WarehouseId, string WarehouseName, string Status,
    string? Notes, DateTime CreatedAt, int LineCount, int CountedLines);

public sealed record PhysicalCountLineDto(
    Guid Id, Guid ProductId, string ProductName, string? ProductSku,
    decimal ExpectedQuantity, decimal? CountedQuantity, decimal Difference,
    string? Notes, string Status);

public sealed record PhysicalCountDetailDto(
    Guid Id, Guid WarehouseId, string WarehouseName, string Status,
    string? Notes, DateTime CreatedAt, DateTime? CompletedAt, DateTime? ApprovedAt,
    List<PhysicalCountLineDto> Lines);

public sealed record CreatePhysicalCountCommand(
    Guid WarehouseId, string? Notes);

public sealed record AddCountLineCommand(Guid ProductId, decimal ExpectedQuantity, string? Notes);

public sealed record RecordCountLineCommand(decimal CountedQuantity, string? Notes);
