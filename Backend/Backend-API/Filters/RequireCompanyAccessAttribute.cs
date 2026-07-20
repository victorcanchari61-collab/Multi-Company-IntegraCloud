using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Backend_API.Filters;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public sealed class RequireCompanyAccessAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var isOwner = context.HttpContext.User.FindFirst("is_owner")?.Value == "true";
        if (isOwner)
            return;

        var companyIdClaim = context.HttpContext.User.FindFirst("company_id")?.Value;
        var routeCompanyId = context.RouteData.Values["companyId"]?.ToString();

        if (string.IsNullOrEmpty(companyIdClaim) || string.IsNullOrEmpty(routeCompanyId))
        {
            context.Result = new ForbidResult();
            return;
        }

        if (!string.Equals(companyIdClaim, routeCompanyId, StringComparison.OrdinalIgnoreCase))
        {
            context.Result = new ForbidResult();
            return;
        }

        await Task.CompletedTask;
    }
}
