using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Auth;

public sealed record GetCompanyPermissionsQuery(Guid UserId, Guid CompanyId) : IRequest<Result<List<string>>>;

public sealed class GetCompanyPermissionsQueryHandler(
    IPermissionRepository permissionRepository,
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    ICompanyModuleAccessRepository accessRepository)
    : IRequestHandler<GetCompanyPermissionsQuery, Result<List<string>>>
{
    public async Task<Result<List<string>>> Handle(GetCompanyPermissionsQuery request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, ct);
        if (user is null)
            return Result<List<string>>.Failure(
                Error.NotFound("user.not_found", "User not found."));

        var companyId = user.CompanyId ?? request.CompanyId;
        var userRoles = await roleRepository.GetByCompanyIdAsync(companyId, ct);
        var permittedModuleIds = (await accessRepository.GetByCompanyIdAsync(companyId, ct))
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
