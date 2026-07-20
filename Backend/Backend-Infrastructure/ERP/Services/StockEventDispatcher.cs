using System.Text.Json;
using Backend.Infrastructure.ERP.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Backend.Infrastructure.ERP.Services;

public sealed class StockEventDispatcher(
    IConnectionMultiplexer redis,
    IServiceScopeFactory scopeFactory,
    ILogger<StockEventDispatcher> logger)
    : BackgroundService
{
    private const string Channel = "stock:updated";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var subscriber = redis.GetSubscriber();
        var channel = new RedisChannel(Channel, RedisChannel.PatternMode.Literal);

        await subscriber.SubscribeAsync(channel, async (_, message) =>
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var hub = scope.ServiceProvider.GetRequiredService<IHubContext<StockHub>>();

                var data = JsonSerializer.Deserialize<StockUpdateMessage>((string)message!);
                if (data is null) return;

                await hub.Clients
                    .Group($"company:{data.CompanyId}")
                    .SendAsync("StockUpdated", data, stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error dispatching stock update via SignalR");
            }
        });
    }

    private sealed record StockUpdateMessage
    {
        public string CompanyId { get; init; } = null!;
        public string WarehouseId { get; init; } = null!;
        public string ProductId { get; init; } = null!;
        public decimal Quantity { get; init; }
        public DateTime Timestamp { get; init; }
    }
}
