using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Auth;

public sealed record LoginCommand(string Email, string Password, string? Slug = null) : IRequest<Result<AuthTokensDto>>;

public sealed class LoginCommandHandler(
    IUserRepository userRepository,
    ICompanyRepository companyRepository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    IRoleRepository roleRepository,
    IPermissionCache permissionCache)
    : IRequestHandler<LoginCommand, Result<AuthTokensDto>>
{
    public async Task<Result<AuthTokensDto>> Handle(LoginCommand request, CancellationToken ct)
    {
        Guid? companyId = null;

        if (request.Slug is not null)
        {
            var company = await companyRepository.GetBySlugAsync(request.Slug, ct);
            if (company is null)
                return Result<AuthTokensDto>.Failure(
                    Error.NotFound("company.not_found", "Company not found."));

            if (company.Status != 1)
                return Result<AuthTokensDto>.Failure(
                    Error.Forbidden("company.suspended", "Company is suspended."));

            companyId = company.Id;
        }

        User? user;

        if (companyId.HasValue)
            user = await userRepository.GetByEmailAsync(companyId, request.Email, ct);
        else
            user = await userRepository.GetByEmailAsync(null, request.Email, ct);

        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
            return Result<AuthTokensDto>.Failure(
                Error.Unauthorized("auth.invalid_credentials", "Invalid email or password."));

        if (user.Status != 1)
            return Result<AuthTokensDto>.Failure(
                Error.Forbidden("auth.account_suspended", "Account is suspended."));

        var roles = await roleRepository.GetByCompanyIdAsync(user.CompanyId ?? Guid.Empty, ct);
        var roleNames = roles.Select(r => r.Name).ToList();

        var accessToken = tokenService.GenerateAccessToken(user.Id, user.CompanyId, user.IsOwner, roleNames);
        var refreshToken = tokenService.GenerateRefreshToken();

        var expiresAt = DateTime.UtcNow.AddHours(8);
        var result = new AuthTokensDto(accessToken, refreshToken, expiresAt);

        await CacheUserPermissions(user.Id, user.CompanyId, ct);

        return Result<AuthTokensDto>.Success(result);
    }

    private async Task CacheUserPermissions(Guid userId, Guid? companyId, CancellationToken ct)
    {
        await Task.CompletedTask;
    }
}
