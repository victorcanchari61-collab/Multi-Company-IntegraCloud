using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Roles;

public sealed record AddRoleRestrictionCommand(Guid RoleId, string RestrictedKey) : IRequest<Result>;

public sealed class AddRoleRestrictionCommandHandler(
    IRoleRepository roleRepository)
    : IRequestHandler<AddRoleRestrictionCommand, Result>
{
    public async Task<Result> Handle(AddRoleRestrictionCommand request, CancellationToken ct)
    {
        var role = await roleRepository.GetByIdWithRestrictionsAsync(request.RoleId, ct);
        if (role is null)
            return Result.Failure(Error.NotFound("role.not_found", "Role not found."));

        role.Restrict(request.RestrictedKey);
        return Result.Success();
    }
}
