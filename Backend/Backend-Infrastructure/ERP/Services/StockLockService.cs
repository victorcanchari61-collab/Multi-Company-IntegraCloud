using Backend.Domain.ERP.Services;
using StackExchange.Redis;

namespace Backend.Infrastructure.ERP.Services;

internal sealed class StockLockService(IConnectionMultiplexer redis) : IStockLockService
{
    private readonly IDatabase _db = redis.GetDatabase();
    private static readonly TimeSpan DefaultExpiry = TimeSpan.FromSeconds(10);

    private static string LockKey(string key) => $"lock:stock:{key}";

    public async Task<bool> AcquireLockAsync(string lockKey, TimeSpan expiry)
        => await _db.StringSetAsync(LockKey(lockKey), "1", expiry, When.NotExists);

    public async Task ReleaseLockAsync(string lockKey)
        => await _db.KeyDeleteAsync(LockKey(lockKey));
}
