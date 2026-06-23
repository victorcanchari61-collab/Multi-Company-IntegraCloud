using Backend.SharedKernel;

namespace Backend.Domain.IAM.Services;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface ITokenService
{
    string GenerateAccessToken(Guid userId, Guid? companyId, bool isOwner, IReadOnlyCollection<string> roles);
    string GenerateRefreshToken();
}

public interface IPermissionCache
{
    Task SetPermissionsAsync(Guid userId, List<string> permissions, TimeSpan? ttl = null);
    Task<List<string>?> GetPermissionsAsync(Guid userId);
    Task InvalidateAsync(Guid userId);
    Task InvalidateByCompanyAsync(Guid companyId);
}
