using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Users;

public sealed record AssignRolesToUserCommand(
    Guid UserId,
    Guid[] RoleIds) : IRequest<Result>;

public sealed class AssignRolesToUserCommandHandler(
    IUserRepository userRepository,
    IRoleRepository roleRepository)
    : IRequestHandler<AssignRolesToUserCommand, Result>
{
    public async Task<Result> Handle(AssignRolesToUserCommand request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result.Failure(Error.NotFound("user.not_found", "User not found."));

        foreach (var roleId in request.RoleIds)
        {
            var role = await roleRepository.GetByIdAsync(roleId, ct);
            if (role is null)
                return Result.Failure(Error.NotFound("role.not_found", $"Role {roleId} not found."));

            if (role.CompanyId != user.CompanyId)
                return Result.Failure(
                    Error.Validation("role.company_mismatch", "Role does not belong to the user's company."));

            user.AssignRole(roleId);
        }

        userRepository.Update(user);
        return Result.Success();
    }
}
