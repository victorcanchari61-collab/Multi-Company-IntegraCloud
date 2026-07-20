using System.Text.Json;
using Backend.Domain.ERP.Services;
using StackExchange.Redis;

namespace Backend.Infrastructure.ERP.Services;

internal sealed class RedisStockCache(IConnectionMultiplexer redis) : IRedisStockCache
{
    private readonly IDatabase _db = redis.GetDatabase();
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);
    private const string Channel = "stock:updated";

    private static string StockKey(Guid companyId, Guid warehouseId, Guid productId)
        => $"stock:{companyId}:{warehouseId}:{productId}";

    public async Task<decimal?> GetStockAsync(Guid companyId, Guid warehouseId, Guid productId)
    {
        var val = await _db.StringGetAsync(StockKey(companyId, warehouseId, productId));
        return val.HasValue ? (decimal?)decimal.Parse(val!) : null;
    }

    public async Task SetStockAsync(Guid companyId, Guid warehouseId, Guid productId, decimal quantity)
        => await _db.StringSetAsync(StockKey(companyId, warehouseId, productId), quantity.ToString(), CacheTtl);

    public async Task InvalidateStockAsync(Guid companyId, Guid warehouseId, Guid productId)
        => await _db.KeyDeleteAsync(StockKey(companyId, warehouseId, productId));

    public async Task PublishStockUpdateAsync(Guid companyId, Guid warehouseId, Guid productId, decimal newQuantity)
    {
        var message = JsonSerializer.Serialize(new
        {
            CompanyId = companyId.ToString(),
            WarehouseId = warehouseId.ToString(),
            ProductId = productId.ToString(),
            Quantity = newQuantity,
            Timestamp = DateTime.UtcNow
        });
        await _db.PublishAsync(new RedisChannel(Channel, RedisChannel.PatternMode.Literal), message);
    }
}
