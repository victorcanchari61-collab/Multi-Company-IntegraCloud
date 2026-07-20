using Backend.SharedKernel;

namespace Backend.Domain.ERP.Events;

public sealed class StockUpdatedEvent(
    Guid companyId,
    Guid warehouseId,
    Guid productId,
    decimal newQuantity,
    decimal? unitCost,
    string movementType) : DomainEvent
{
    public Guid CompanyId { get; } = companyId;
    public Guid WarehouseId { get; } = warehouseId;
    public Guid ProductId { get; } = productId;
    public decimal NewQuantity { get; } = newQuantity;
    public decimal? UnitCost { get; } = unitCost;
    public string MovementType { get; } = movementType;
}

