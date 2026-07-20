using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Companies;

public sealed record GetCompanyAccessQuery(Guid CompanyId) : IRequest<Result<CompanyAccessResult>>;

public sealed record CompanyAccessResult(Guid CompanyId, List<SystemAccessDto> Systems);

public sealed record SystemAccessDto(
    Guid SystemId,
    string Code,
    string Name,
    bool Granted,
    bool IsBase,
    List<ModuleAccessDto> Modules);

public sealed record ModuleAccessDto(Guid ModuleId, string Code, string Name, bool Granted);

public sealed class GetCompanyAccessQueryHandler(
    ISystemRepository systemRepository,
    IModuleRepository moduleRepository,
    ICompanySystemAccessRepository systemAccessRepository,
    ICompanyModuleAccessRepository moduleAccessRepository)
    : IRequestHandler<GetCompanyAccessQuery, Result<CompanyAccessResult>>
{
    public async Task<Result<CompanyAccessResult>> Handle(GetCompanyAccessQuery request, CancellationToken ct)
    {
        // IAM es el sistema BASE: toda empresa lo tiene siempre (gestiona sus usuarios/roles/permisos).
        // El resto (ERP/WMS/POS/RRHH) se licencia. El módulo "companies" de IAM es solo del dueño.
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

        var dtos = systems.Select(s =>
        {
            var isBase = s.Code == "IAM";
            var modules = allModules
                .Where(m => m.SystemId == s.Id && m.IsActive)
                .Where(m => !(isBase && m.Code == "companies")) // gestión de empresas = solo dueño
                .OrderBy(m => m.Name)
                .Select(m => new ModuleAccessDto(
                    m.Id, m.Code, m.Name, isBase || grantedModuleIds.Contains(m.Id)))
                .ToList();

            return new SystemAccessDto(
                s.Id, s.Code, s.Name, isBase || grantedSystemIds.Contains(s.Id), isBase, modules);
        }).ToList();

        return Result<CompanyAccessResult>.Success(new CompanyAccessResult(request.CompanyId, dtos));
    }
}
