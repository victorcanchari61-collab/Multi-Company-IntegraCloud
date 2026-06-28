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
    IModuleRepository moduleRepository,
    ISystemRepository systemRepository,
    ICompanyModuleAccessRepository accessRepository)
    : IRequestHandler<AssignPermissionsToRoleCommand, Result>
{
    public async Task<Result> Handle(AssignPermissionsToRoleCommand request, CancellationToken ct)
    {
        var role = await roleRepository.GetByIdWithPermissionsAsync(request.RoleId, ct);
        if (role is null)
            return Result.Failure(Error.NotFound("role.not_found", "Role not found."));

        // Módulos permitidos = IAM base (users/roles/permissions, sin companies) + módulos licenciados.
        var allModules = await moduleRepository.GetAllAsync(ct);
        var iam = (await systemRepository.GetAllAsync(ct)).FirstOrDefault(s => s.Code == "IAM");
        var baseModuleIds = allModules
            .Where(m => iam is not null && m.SystemId == iam.Id && m.Code != "companies")
            .Select(m => m.Id);
        var licensedModuleIds = (await accessRepository.GetByCompanyIdAsync(role.CompanyId, ct))
            .Select(a => a.ModuleId);
        var companiesModuleIds = allModules.Where(m => m.Code == "companies").Select(m => m.Id).ToHashSet();
        var allowedModuleIds = baseModuleIds
            .Concat(licensedModuleIds)
            .Where(id => !companiesModuleIds.Contains(id))
            .ToHashSet();

        // Valida que cada permiso pertenezca a un módulo permitido para la empresa.
        foreach (var permissionId in request.PermissionIds)
        {
            var permission = await permissionRepository.GetByIdAsync(permissionId, ct);
            if (permission is null)
                return Result.Failure(Error.NotFound("permission.not_found", $"Permission {permissionId} not found."));

            if (!allowedModuleIds.Contains(permission.ModuleId))
                return Result.Failure(
                    Error.Forbidden("permission.not_licensed",
                        $"El permiso '{permission.Key}' pertenece a un módulo no disponible para la empresa."));
        }

        // Reemplaza el conjunto completo de permisos (agrega y quita).
        role.SetPermissions(request.PermissionIds);
        roleRepository.Update(role);

        return Result.Success();
    }
}
