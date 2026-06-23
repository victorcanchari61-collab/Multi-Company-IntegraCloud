using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Auth;

public sealed record GetMyPermissionsQuery(Guid UserId) : IRequest<Result<List<string>>>;

public sealed class GetMyPermissionsQueryHandler(
    IPermissionRepository permissionRepository,
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    ICompanyModuleAccessRepository accessRepository)
    : IRequestHandler<GetMyPermissionsQuery, Result<List<string>>>
{
    public async Task<Result<List<string>>> Handle(GetMyPermissionsQuery request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result<List<string>>.Failure(
                Error.NotFound("user.not_found", "User not found."));

        if (user.IsOwner)
        {
            var allPermissions = await permissionRepository.GetAllAsync(ct);
            return Result<List<string>>.Success(allPermissions.Select(p => p.Key).ToList());
        }

        var userRoles = await roleRepository.GetByCompanyIdAsync(user.CompanyId ?? Guid.Empty, ct);
        var permittedModuleIds = (await accessRepository.GetByCompanyIdAsync(user.CompanyId ?? Guid.Empty, ct))
            .Select(a => a.ModuleId)
            .ToHashSet();

        var permissionIds = userRoles
            .SelectMany(r => r.RolePermissions)
            .Select(rp => rp.PermissionId)
            .Distinct()
            .ToHashSet();

        var allPerms = await permissionRepository.GetAllAsync(ct);
        var effective = allPerms
            .Where(p => permissionIds.Contains(p.Id) && permittedModuleIds.Contains(p.ModuleId))
            .Select(p => p.Key)
            .Distinct()
            .ToList();

        return Result<List<string>>.Success(effective);
    }
}
