using System.Text.Json;
using Backend.Domain.IAM.Services;
using StackExchange.Redis;

namespace Backend.Infrastructure.IAM.Services;

internal sealed class RedisPermissionCache(IConnectionMultiplexer redis) : IPermissionCache
{
    private readonly IDatabase _db = redis.GetDatabase();
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromMinutes(30);

    private static string PermissionKey(Guid userId) => $"perm:user:{userId}";

    public async Task SetPermissionsAsync(Guid userId, List<string> permissions, TimeSpan? ttl = null)
    {
        var json = JsonSerializer.Serialize(permissions);
        await _db.StringSetAsync(PermissionKey(userId), json, ttl ?? DefaultTtl);
    }

    public async Task<List<string>?> GetPermissionsAsync(Guid userId)
    {
        var json = await _db.StringGetAsync(PermissionKey(userId));
        return json.HasValue
            ? JsonSerializer.Deserialize<List<string>>((string)json!)
            : null;
    }

    public async Task InvalidateAsync(Guid userId)
        => await _db.KeyDeleteAsync(PermissionKey(userId));

    public async Task InvalidateByCompanyAsync(Guid companyId)
    {
        var keys = _db.Multiplexer.GetServer(_db.Multiplexer.GetEndPoints()[0])
            .Keys(pattern: $"perm:user:*")
            .ToArray();

        if (keys.Length > 0)
            await _db.KeyDeleteAsync(keys);
    }
}
