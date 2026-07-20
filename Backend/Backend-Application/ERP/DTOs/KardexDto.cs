namespace Backend.Application.ERP.DTOs;

public sealed record KardexEntryDto(
    Guid Id, Guid ProductId, string? ProductName,
    Guid WarehouseId, string? WarehouseName,
    string MovementType, decimal QuantityIn, decimal QuantityOut,
    decimal Balance, decimal PreviousBalance,
    decimal? UnitCost, decimal? TotalCost,
    string? ReferenceType, string? Notes, DateTime CreatedAt);

public sealed record TransferDto(
    Guid Id, string FromWarehouse, string ToWarehouse,
    string Status, string? Notes, DateTime CreatedAt, DateTime? CompletedAt,
    List<TransferItemDto> Items);

public sealed record TransferItemDto(
    Guid Id, Guid ProductId, string? ProductName, decimal Quantity, decimal? UnitCost);

public sealed record CreateTransferCommand(
    Guid FromWarehouseId, Guid ToWarehouseId, string? Notes,
    List<CreateTransferItem> Items);

public sealed record CreateTransferItem(Guid ProductId, decimal Quantity, decimal? UnitCost);
