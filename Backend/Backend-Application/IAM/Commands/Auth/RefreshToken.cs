using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Auth;

public sealed record RefreshTokenCommand(string RefreshToken) : IRequest<Result<AuthTokensDto>>;

public sealed class RefreshTokenCommandHandler(
    IRefreshTokenRepository refreshTokenRepository,
    IUserRepository userRepository,
    ITokenService tokenService,
    IRoleRepository roleRepository)
    : IRequestHandler<RefreshTokenCommand, Result<AuthTokensDto>>
{
    public async Task<Result<AuthTokensDto>> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var token = await refreshTokenRepository.GetByTokenHashAsync(request.RefreshToken, ct);

        if (token is null || !token.IsActive)
            return Result<AuthTokensDto>.Failure(
                Error.Unauthorized("auth.invalid_token", "Invalid or expired refresh token."));

        token.Revoke();

        var user = await userRepository.GetByIdAsync(token.UserId, ct);
        if (user is null || user.Status != 1)
            return Result<AuthTokensDto>.Failure(
                Error.Unauthorized("auth.user_inactive", "User is inactive."));

        var roles = await roleRepository.GetByCompanyIdAsync(user.CompanyId ?? Guid.Empty, ct);
        var roleNames = roles.Select(r => r.Name).ToList();

        var accessToken = tokenService.GenerateAccessToken(user.Id, user.CompanyId, user.IsOwner, roleNames);
        var newRefreshToken = tokenService.GenerateRefreshToken();

        var expiresAt = DateTime.UtcNow.AddHours(8);
        return Result<AuthTokensDto>.Success(new AuthTokensDto(accessToken, newRefreshToken, expiresAt));
    }
}
