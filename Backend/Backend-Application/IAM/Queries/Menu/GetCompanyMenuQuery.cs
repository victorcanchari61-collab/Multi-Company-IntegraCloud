using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Menu;

public sealed record GetCompanyMenuQuery(Guid CompanyId) : IRequest<Result<List<MenuSectionDto>>>;

public sealed class GetCompanyMenuQueryHandler(
    ISystemRepository systemRepository,
    IModuleRepository moduleRepository,
    ICompanySystemAccessRepository systemAccessRepository,
    ICompanyModuleAccessRepository moduleAccessRepository)
    : IRequestHandler<GetCompanyMenuQuery, Result<List<MenuSectionDto>>>
{
    private static readonly Dictionary<string, (string Route, string Label)> ModuleConfig = new()
    {
        ["IAM:users"] = ("/iam/users", "Usuarios"),
        ["IAM:roles"] = ("/iam/roles", "Roles"),
        ["IAM:permissions"] = ("/iam/permissions", "Permisos"),
        ["ERP:units"] = ("/erp/unidades", "Unidades"),
    };

    public async Task<Result<List<MenuSectionDto>>> Handle(GetCompanyMenuQuery request, CancellationToken ct)
    {
        var systems = (await systemRepository.GetAllAsync(ct))
            .Where(s => s.IsActive)
            .OrderBy(s => s.Code == "IAM" ? 0 : 1)
            .ThenBy(s => s.Name)
            .ToList();

        var allModules = await moduleRepository.GetAllAsync(ct);

        var grantedSystemIds = (await systemAccessRepository.GetByCompanyIdAsync(request.CompanyId, ct))
            .Select(a => a.SystemId).ToHashSet();
        var grantedModuleIds = (await moduleAccessRepository.GetByCompanyIdAsync(request.CompanyId, ct))
            .Select(a => a.ModuleId).ToHashSet();

        var sections = systems
            .Select(system =>
            {
                var isBase = system.Code == "IAM";
                if (!isBase && !grantedSystemIds.Contains(system.Id))
                    return null;

                var modules = allModules
                    .Where(m => m.SystemId == system.Id && m.IsActive)
                    .Where(m => m.Code != "companies")
                    .Where(m => grantedModuleIds.Contains(m.Id))
                    .OrderBy(m => m.Name)
                    .Select(m =>
                    {
                        var key = $"{system.Code}:{m.Code}";
                        if (ModuleConfig.TryGetValue(key, out var config))
                            return new MenuItemDto(m.Code, config.Label, config.Route);
                        return null;
                    })
                    .Where(m => m is not null)
                    .Cast<MenuItemDto>()
                    .ToList();

                if (modules.Count == 0)
                    return null;

                return new MenuSectionDto(system.Code, system.Name, modules);
            })
            .Where(s => s is not null)
            .Cast<MenuSectionDto>()
            .ToList();

        return Result<List<MenuSectionDto>>.Success(sections);
    }
}
