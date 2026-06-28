using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Roles;

public sealed record DeleteRoleCommand(Guid RoleId) : IRequest<Result>;

public sealed class DeleteRoleCommandHandler(
    IRoleRepository roleRepository)
    : IRequestHandler<DeleteRoleCommand, Result>
{
    public async Task<Result> Handle(DeleteRoleCommand request, CancellationToken ct)
    {
        var role = await roleRepository.GetByIdAsync(request.RoleId, ct);
        if (role is null)
            return Result.Failure(Error.NotFound("role.not_found", "Role not found."));

        if (role.UserRoles.Count > 0)
            return Result.Failure(
                Error.Conflict("role.has_users",
                    "Cannot delete a role that is assigned to users. Remove all assignments first."));

        roleRepository.Delete(role);
        return Result.Success();
    }
}
