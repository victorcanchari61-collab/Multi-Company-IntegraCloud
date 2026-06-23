using System.Security.Claims;

namespace Backend_API.Middleware;

public sealed class TenantContext
{
    public Guid? UserId { get; set; }
    public Guid? CompanyId { get; set; }
    public bool IsOwner { get; set; }
    public IReadOnlyCollection<string> Roles { get; set; } = [];
}

public sealed class TenantContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, TenantContext tenantContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var subClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(subClaim, out var userId))
                tenantContext.UserId = userId;

            var companyClaim = context.User.FindFirst("company_id")?.Value;
            if (Guid.TryParse(companyClaim, out var companyId))
                tenantContext.CompanyId = companyId;

            tenantContext.IsOwner = context.User.FindFirst("is_owner")?.Value == "true";
            tenantContext.Roles = context.User.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList();
        }

        await next(context);
    }
}
