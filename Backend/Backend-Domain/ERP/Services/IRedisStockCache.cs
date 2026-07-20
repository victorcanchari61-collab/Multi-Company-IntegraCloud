namespace Backend.Domain.ERP.Services;

public interface IRedisStockCache
{
    Task<decimal?> GetStockAsync(Guid companyId, Guid warehouseId, Guid productId);
    Task SetStockAsync(Guid companyId, Guid warehouseId, Guid productId, decimal quantity);
    Task InvalidateStockAsync(Guid companyId, Guid warehouseId, Guid productId);
    Task PublishStockUpdateAsync(Guid companyId, Guid warehouseId, Guid productId, decimal newQuantity);
}
