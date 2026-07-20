using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Roles;

public sealed record UpdateRoleCommand(
    Guid RoleId,
    string Name,
    string? Description,
    string? RolSistema = null,
    Guid? ParentRoleId = null,
    int SortOrder = 0) : IRequest<Result>;

public sealed class UpdateRoleCommandHandler(IRoleRepository roleRepository)
    : IRequestHandler<UpdateRoleCommand, Result>
{
    public async Task<Result> Handle(UpdateRoleCommand request, CancellationToken ct)
    {
        var role = await roleRepository.GetByIdAsync(request.RoleId, ct);
        if (role is null)
            return Result.Failure(Error.NotFound("role.not_found", "Role not found."));

        role.Update(request.Name, request.Description, request.RolSistema, request.ParentRoleId, request.SortOrder);
        roleRepository.Update(role);
        return Result.Success();
    }
}
