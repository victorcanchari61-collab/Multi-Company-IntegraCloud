namespace Backend.Application.IAM.DTOs;

public sealed record AuthTokensDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    IReadOnlyCollection<string>? AllRestrictions = null,
    string? RolSistema = null,
    IReadOnlyCollection<string>? AuthGrants = null
);
