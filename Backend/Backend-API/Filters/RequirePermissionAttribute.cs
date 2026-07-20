using System.Security.Claims;
using Backend.Domain.IAM.Services;
using Backend.SharedKernel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace Backend_API.Filters;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class RequirePermissionAttribute(string permissionKey) : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var isOwner = context.HttpContext.User.FindFirst("is_owner")?.Value == "true";
        if (isOwner)
            return; // Owner has all permissions

        var permissionCache = context.HttpContext.RequestServices.GetRequiredService<IPermissionCache>();
        var permissions = await permissionCache.GetPermissionsAsync(userId);

        if (permissions is null)
        {
            // Cache miss - let the request go through; the service will check permissions
            return;
        }

        var hasPermission = permissions.Any(p =>
            permissionKey == p ||
            WildcardMatch(p, permissionKey));

        if (!hasPermission)
        {
            context.Result = new ForbidResult();
        }
    }

    private static bool WildcardMatch(string pattern, string key)
    {
        if (pattern.EndsWith(".*"))
        {
            var prefix = pattern[..^2];
            return key.StartsWith(prefix);
        }
        return pattern == key;
    }
}
