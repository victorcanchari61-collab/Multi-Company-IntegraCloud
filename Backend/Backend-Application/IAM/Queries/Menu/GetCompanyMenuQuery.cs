using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Menu;

public sealed record GetCompanyMenuQuery(Guid CompanyId) : IRequest<Result<List<MenuSectionDto>>>;

public sealed class GetCompanyMenuQueryHandler(
    ISystemRepository systemRepository,
    IModuleRepository moduleRepository,
    IViewRepository viewRepository,
    ICompanySystemAccessRepository systemAccessRepository,
    ICompanyModuleAccessRepository moduleAccessRepository)
    : IRequestHandler<GetCompanyMenuQuery, Result<List<MenuSectionDto>>>
{
    // Módulos HOJA (sin submódulos/views): su ruta, etiqueta y permiso requerido vienen de aquí.
    private static readonly Dictionary<string, (string Route, string Label, string Permission)> LeafModuleConfig = new()
    {
        ["IAM:users"] = ("/iam/users", "Usuarios", "iam.users.read"),
        ["IAM:roles"] = ("/iam/roles", "Roles", "iam.roles.read"),
        ["IAM:permissions"] = ("/iam/permissions", "Permisos", "iam.permissions.read"),
    };

    public async Task<Result<List<MenuSectionDto>>> Handle(GetCompanyMenuQuery request, CancellationToken ct)
    {
        var systems = (await systemRepository.GetAllAsync(ct))
            .Where(s => s.IsActive)
            .OrderBy(s => s.Code == "IAM" ? 0 : 1)
            .ThenBy(s => s.Name)
            .ToList();

        var allModules = await moduleRepository.GetAllAsync(ct);
        var allViews = await viewRepository.GetAllAsync(ct);

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
                    .Where(m => m.Code != "companies")            // gestión de empresas = solo dueño
                    .Where(m => isBase || grantedModuleIds.Contains(m.Id)) // IAM base siempre; resto si está licenciado
                    .OrderBy(m => m.Name)
                    .Select(m =>
                    {
                        var modulePermission = $"{system.Code.ToLowerInvariant()}.{m.Code.ToLowerInvariant()}.read";

                        // Submódulos = views del módulo (con ruta).
                        var submodules = allViews
                            .Where(v => v.ModuleId == m.Id && !string.IsNullOrEmpty(v.Route))
                            .OrderBy(v => v.Name)
                            .Select(v => new MenuItemDto(v.Code, v.Name, v.Route!, modulePermission))
                            .ToList();

                        if (submodules.Count > 0)
                            return new MenuModuleDto(m.Code, m.Name, null, modulePermission, submodules);

                        // Sin views → módulo hoja (link directo) según config.
                        var key = $"{system.Code}:{m.Code}";
                        if (LeafModuleConfig.TryGetValue(key, out var cfg))
                            return new MenuModuleDto(m.Code, cfg.Label, cfg.Route, cfg.Permission, new List<MenuItemDto>());

                        return null;
                    })
                    .Where(m => m is not null)
                    .Cast<MenuModuleDto>()
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
