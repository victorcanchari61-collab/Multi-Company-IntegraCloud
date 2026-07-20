using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Interfaces;
using Backend.Domain.IAM.Repositories;
using Backend.Domain.IAM.Services;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Auth;

public sealed record GetMeQuery(Guid UserId) : IRequest<Result<UserProfileDto>>;

public sealed class GetMeQueryHandler(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IEffectiveAccessService effectiveAccessService,
    IAuthorizationGrantRepository grantRepository)
    : IRequestHandler<GetMeQuery, Result<UserProfileDto>>
{
    public async Task<Result<UserProfileDto>> Handle(GetMeQuery request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result<UserProfileDto>.Failure(
                Error.NotFound("user.not_found", "User not found."));

        var roles = await roleRepository.GetByCompanyIdAsync(user.CompanyId ?? Guid.Empty, ct);

        var profile = await effectiveAccessService.GetForUserAsync(user.Id, ct);
        var allRestrictions = profile?.Restrictions ?? [];

        var grants = await grantRepository.GetActiveByUserAsync(user.Id, ct);
        var authGrants = grants.Select(g => $"{g.Module}:{g.Action}").ToList();

        var roleNames = roles.Select(r => r.Name).ToList();

        return Result<UserProfileDto>.Success(new UserProfileDto(
            user.Id, user.Email, user.FullName,
            user.CompanyId, user.IsOwner,
            roleNames,
            allRestrictions,
            user.RolSistema,
            authGrants,
            roleNames.FirstOrDefault()
        ));
    }
}
