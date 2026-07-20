using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Permissions;

/// <summary>
/// Catálogo de permisos ASIGNABLES por una empresa: solo los de sus módulos.
/// IAM base (users, roles, permissions — sin companies) + módulos licenciados.
/// </summary>
public sealed record GetCompanyPermissionsCatalogQuery(Guid CompanyId)
    : IRequest<Result<List<PermissionTreeDto>>>;

public sealed class GetCompanyPermissionsCatalogQueryHandler(
    IPermissionRepository permissionRepository,
    IModuleRepository moduleRepository,
    ISystemRepository systemRepository,
    ICompanyModuleAccessRepository moduleAccessRepository)
    : IRequestHandler<GetCompanyPermissionsCatalogQuery, Result<List<PermissionTreeDto>>>
{
    public async Task<Result<List<PermissionTreeDto>>> Handle(GetCompanyPermissionsCatalogQuery request, CancellationToken ct)
    {
        var allModules = await moduleRepository.GetAllAsync(ct);
        var iam = (await systemRepository.GetAllAsync(ct)).FirstOrDefault(s => s.Code == "IAM");

        // IAM base: toda empresa lo tiene, pero el módulo "companies" es solo del dueño.
        var baseModuleIds = allModules
            .Where(m => iam is not null && m.SystemId == iam.Id && m.Code != "companies")
            .Select(m => m.Id);

        // Módulos licenciados a la empresa (ERP, etc.).
        var grantedModuleIds = (await moduleAccessRepository.GetByCompanyIdAsync(request.CompanyId, ct))
            .Select(a => a.ModuleId);

        var availableModuleIds = baseModuleIds.Concat(grantedModuleIds).ToHashSet();

        var permissions = await permissionRepository.GetAllAsync(ct);
        var dtos = permissions
            .Where(p => availableModuleIds.Contains(p.ModuleId))
            .OrderBy(p => p.Key)
            .Select(p => new PermissionTreeDto(p.Id, p.Key, p.Description ?? p.Key))
            .ToList();

        return Result<List<PermissionTreeDto>>.Success(dtos);
    }
}
