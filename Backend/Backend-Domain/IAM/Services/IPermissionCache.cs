namespace Backend.Domain.IAM.Services;

public interface IPermissionCache
{
    Task SetPermissionsAsync(Guid userId, List<string> permissions, TimeSpan? ttl = null);
    Task<List<string>?> GetPermissionsAsync(Guid userId);
    Task InvalidateAsync(Guid userId);
    Task InvalidateByCompanyAsync(Guid companyId);
}
