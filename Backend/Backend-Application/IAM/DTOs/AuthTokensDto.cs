namespace Backend.Application.IAM.DTOs;

public sealed record AuthTokensDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt
);
