using Microsoft.AspNetCore.SignalR;

namespace Backend.Infrastructure.ERP.Hubs;

public sealed class StockHub : Hub
{
    public const string Endpoint = "/hubs/stock";

    public async Task JoinCompanyGroup(string companyId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, $"company:{companyId}");

    public async Task LeaveCompanyGroup(string companyId)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"company:{companyId}");
}
