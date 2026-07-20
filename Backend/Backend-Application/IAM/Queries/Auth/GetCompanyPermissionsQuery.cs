using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Auth;

public sealed record GetCompanyPermissionsQuery(Guid UserId, Guid CompanyId) : IRequest<Result<List<string>>>;

public sealed class GetCompanyPermissionsQueryHandler(
    IPermissionRepository permissionRepository,
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IModuleRepository moduleRepository,
    ISystemRepository systemRepository,
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

        var allModules = await moduleRepository.GetAllAsync(ct);
        var iam = (await systemRepository.GetAllAsync(ct)).FirstOrDefault(s => s.Code == "IAM");

        // Módulos efectivos = IAM base (siempre, sin "companies") + módulos licenciados.
        // "companies" es solo del dueño → nunca efectivo para una empresa.
        var baseModuleIds = allModules
            .Where(m => iam is not null && m.SystemId == iam.Id && m.Code != "companies")
            .Select(m => m.Id);
        var grantedModuleIds = (await accessRepository.GetByCompanyIdAsync(companyId, ct))
            .Select(a => a.ModuleId);
        var companiesModuleIds = allModules.Where(m => m.Code == "companies").Select(m => m.Id).ToHashSet();

        var permittedModuleIds = baseModuleIds
            .Concat(grantedModuleIds)
            .Where(id => !companiesModuleIds.Contains(id))
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
