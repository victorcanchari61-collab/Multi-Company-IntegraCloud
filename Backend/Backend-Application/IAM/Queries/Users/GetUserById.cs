using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Users;

public sealed record GetUserByIdQuery(Guid UserId) : IRequest<Result<UserDetailResult>>;

public sealed record UserDetailResult(
    Guid Id,
    string Email,
    string FullName,
    int Status,
    DateTime CreatedAt,
    List<UserRoleResult> Roles);

public sealed record UserRoleResult(
    Guid RoleId,
    string RoleName);

public sealed class GetUserByIdQueryHandler(
    IUserRepository userRepository)
    : IRequestHandler<GetUserByIdQuery, Result<UserDetailResult>>
{
    public async Task<Result<UserDetailResult>> Handle(GetUserByIdQuery request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdWithRolesAsync(request.UserId, ct);
        if (user is null)
            return Result<UserDetailResult>.Failure(
                Error.NotFound("user.not_found", "User not found."));

        return Result<UserDetailResult>.Success(new UserDetailResult(
            user.Id,
            user.Email,
            user.FullName,
            user.Status,
            user.CreatedAt,
            user.UserRoles
                .Select(ur => new UserRoleResult(ur.RoleId, ur.Role.Name))
                .ToList()
        ));
    }
}
