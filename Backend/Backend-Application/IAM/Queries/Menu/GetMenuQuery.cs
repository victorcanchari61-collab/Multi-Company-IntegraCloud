using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Menu;

public sealed record GetMenuQuery(bool IsOwner, Guid? CompanyId) : IRequest<Result<List<MenuSectionDto>>>;

public sealed class GetMenuQueryHandler(
    ISystemRepository systemRepository,
    IModuleRepository moduleRepository,
    ICompanySystemAccessRepository systemAccessRepository,
    ICompanyModuleAccessRepository moduleAccessRepository)
    : IRequestHandler<GetMenuQuery, Result<List<MenuSectionDto>>>
{
    private static readonly Dictionary<string, (string Route, string Label)> ModuleConfig = new()
    {
        ["IAM:users"] = ("/iam/users", "Usuarios"),
        ["IAM:roles"] = ("/iam/roles", "Roles"),
        ["IAM:permissions"] = ("/iam/permissions", "Permisos"),
        ["IAM:companies"] = ("/iam/companies", "Empresas"),
        ["ERP:units"] = ("/erp/unidades", "Unidades"),
    };

    public async Task<Result<List<MenuSectionDto>>> Handle(GetMenuQuery request, CancellationToken ct)
    {
        var systems = (await systemRepository.GetAllAsync(ct))
            .Where(s => s.IsActive)
            .OrderBy(s => s.Code == "IAM" ? 0 : 1)
            .ThenBy(s => s.Name)
            .ToList();

        var allModules = await moduleRepository.GetAllAsync(ct);

        HashSet<Guid>? grantedSystemIds = null;
        HashSet<Guid>? grantedModuleIds = null;

        if (!request.IsOwner && request.CompanyId.HasValue)
        {
            grantedSystemIds = (await systemAccessRepository.GetByCompanyIdAsync(request.CompanyId.Value, ct))
                .Select(a => a.SystemId).ToHashSet();
            grantedModuleIds = (await moduleAccessRepository.GetByCompanyIdAsync(request.CompanyId.Value, ct))
                .Select(a => a.ModuleId).ToHashSet();
        }

        var sections = systems.Select(system =>
        {
            var isBase = system.Code == "IAM";

            // Owner solo ve IAM (gestión de plataforma); company user ve sistemas concedidos
            if (!isBase && (request.IsOwner || grantedSystemIds is null || !grantedSystemIds.Contains(system.Id)))
                return null;

            var modules = allModules
                .Where(m => m.SystemId == system.Id && m.IsActive)
                .Where(m => !(isBase && m.Code == "companies" && !request.IsOwner))
                .OrderBy(m => m.Name)
                .Select(m =>
                {
                    var key = $"{system.Code}:{m.Code}";
                    if (ModuleConfig.TryGetValue(key, out var config) && config.Route.Length > 0)
                        return new MenuItemDto(m.Code, config.Label, config.Route);
                    return null;
                })
                .Where(m => m is not null)
                .ToList()!;

            return new MenuSectionDto(system.Code, system.Name, modules);
        }).Where(s => s is not null).ToList()!;

        return Result<List<MenuSectionDto>>.Success(sections);
    }
}
