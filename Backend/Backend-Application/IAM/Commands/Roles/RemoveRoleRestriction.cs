using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Roles;

public sealed record RemoveRoleRestrictionCommand(Guid RoleId, string RestrictedKey) : IRequest<Result>;

public sealed class RemoveRoleRestrictionCommandHandler(
    IRoleRepository roleRepository)
    : IRequestHandler<RemoveRoleRestrictionCommand, Result>
{
    public async Task<Result> Handle(RemoveRoleRestrictionCommand request, CancellationToken ct)
    {
        var role = await roleRepository.GetByIdWithRestrictionsAsync(request.RoleId, ct);
        if (role is null)
            return Result.Failure(Error.NotFound("role.not_found", "Role not found."));

        role.Unrestrict(request.RestrictedKey);
        return Result.Success();
    }
}
