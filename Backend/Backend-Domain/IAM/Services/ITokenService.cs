namespace Backend.Domain.IAM.Services;

public interface ITokenService
{
    string GenerateAccessToken(Guid userId, Guid? companyId, bool isOwner, IReadOnlyCollection<string> roles);
    string GenerateRefreshToken();
}
