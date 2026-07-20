using Microsoft.AspNetCore.SignalR;

namespace Backend.Infrastructure.IAM.Hubs;

public sealed class NotificationHub : Hub
{
    public const string Endpoint = "/hubs/notifications";

    public async Task JoinUserGroup(string userId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");

    public async Task LeaveUserGroup(string userId)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user:{userId}");

    public async Task JoinCompanyGroup(string companyId)
        => await Groups.AddToGroupAsync(Context.ConnectionId, $"company:{companyId}");

    public async Task LeaveCompanyGroup(string companyId)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"company:{companyId}");
}
