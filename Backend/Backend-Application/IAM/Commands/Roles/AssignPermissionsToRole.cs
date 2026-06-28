using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Roles;

public sealed record AssignPermissionsToRoleCommand(
    Guid RoleId,
    Guid[] PermissionIds) : IRequest<Result>;

public sealed class AssignPermissionsToRoleCommandHandler(
    IRoleRepository roleRepository,
    IPermissionRepository permissionRepository,
    ICompanyModuleAccessRepository accessRepository)
    : IRequestHandler<AssignPermissionsToRoleCommand, Result>
{
    public async Task<Result> Handle(AssignPermissionsToRoleCommand request, CancellationToken ct)
    {
        var role = await roleRepository.GetByIdWithPermissionsAsync(request.RoleId, ct);
        if (role is null)
            return Result.Failure(Error.NotFound("role.not_found", "Role not found."));

        var licensedModules = await accessRepository.GetByCompanyIdAsync(role.CompanyId, ct);
        var licensedModuleIds = licensedModules.Select(a => a.ModuleId).ToHashSet();

        foreach (var permissionId in request.PermissionIds)
        {
            var permission = await permissionRepository.GetByIdAsync(permissionId, ct);
            if (permission is null)
                continue;

            if (!licensedModuleIds.Contains(permission.ModuleId))
                return Result.Failure(
                    Error.Forbidden("permission.not_licensed",
                        $"Permission '{permission.Key}' belongs to an unlicensed module."));

            if (!role.RolePermissions.Any(rp => rp.PermissionId == permissionId))
            {
                var rolePermission = new RolePermission(request.RoleId, permissionId);
                role.RolePermissions.Add(rolePermission);
            }
        }

        return Result.Success();
    }
}
