using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Roles;

public sealed record GetRoleByIdQuery(Guid RoleId) : IRequest<Result<RoleDetailResult>>;

public sealed record RoleDetailResult(
    Guid Id,
    string Name,
    string? Description,
    List<PermissionResult> Permissions);

public sealed record PermissionResult(
    Guid Id,
    string Key,
    string Description);

public sealed class GetRoleByIdQueryHandler(
    IRoleRepository roleRepository)
    : IRequestHandler<GetRoleByIdQuery, Result<RoleDetailResult>>
{
    public async Task<Result<RoleDetailResult>> Handle(GetRoleByIdQuery request, CancellationToken ct)
    {
        var role = await roleRepository.GetByIdWithPermissionsAsync(request.RoleId, ct);
        if (role is null)
            return Result<RoleDetailResult>.Failure(
                Error.NotFound("role.not_found", "Role not found."));

        return Result<RoleDetailResult>.Success(new RoleDetailResult(
            role.Id,
            role.Name,
            role.Description,
            role.RolePermissions
                .Select(rp => new PermissionResult(
                    rp.Permission.Id,
                    rp.Permission.Key,
                    rp.Permission.Description ?? rp.Permission.Key))
                .ToList()
        ));
    }
}
