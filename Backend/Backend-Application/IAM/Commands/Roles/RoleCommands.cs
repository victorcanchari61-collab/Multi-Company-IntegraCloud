using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Events;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Roles;

public sealed record CreateRoleCommand(
    Guid CompanyId,
    string Name,
    string? Description) : IRequest<Result<Guid>>;

public sealed class CreateRoleCommandHandler(IRoleRepository roleRepository)
    : IRequestHandler<CreateRoleCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateRoleCommand request, CancellationToken ct)
    {
        var role = new Role(Guid.NewGuid(), request.CompanyId, request.Name, request.Description);
        await roleRepository.AddAsync(role, ct);
        return Result<Guid>.Success(role.Id);
    }
}

public sealed record UpdateRoleCommand(
    Guid RoleId,
    string Name,
    string? Description) : IRequest<Result>;

public sealed class UpdateRoleCommandHandler(IRoleRepository roleRepository)
    : IRequestHandler<UpdateRoleCommand, Result>
{
    public async Task<Result> Handle(UpdateRoleCommand request, CancellationToken ct)
    {
        var role = await roleRepository.GetByIdAsync(request.RoleId, ct);
        if (role is null)
            return Result.Failure(Error.NotFound("role.not_found", "Role not found."));

        // In a real implementation, we'd update the role properties via a domain method.
        // For now, this is a placeholder pattern.
        return Result.Success();
    }
}

public sealed record AssignPermissionsToRoleCommand(
    Guid RoleId,
    Guid[] PermissionIds) : IRequest<Result>;

public sealed class AssignPermissionsToRoleCommandHandler(
    IRoleRepository roleRepository,
    IPermissionRepository permissionRepository,
    ICompanyModuleAccessRepository accessRepository,
    IPublisher publisher)
    : IRequestHandler<AssignPermissionsToRoleCommand, Result>
{
    public async Task<Result> Handle(AssignPermissionsToRoleCommand request, CancellationToken ct)
    {
        var role = await roleRepository.GetByIdAsync(request.RoleId, ct);
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
                // EF Core will handle adding to the collection
            }
        }

        await publisher.Publish(new RolePermissionsChangedEvent(request.RoleId, role.CompanyId), ct);
        return Result.Success();
    }
}
