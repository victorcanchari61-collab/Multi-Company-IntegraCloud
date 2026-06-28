using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Companies;

public sealed record GetCompanyModulesQuery(Guid CompanyId) : IRequest<Result<CompanyModulesResult>>;

public sealed record CompanyModulesResult(
    Guid CompanyId,
    List<ModuleDto> GrantedModules,
    List<ModuleDto> AvailableModules);

public sealed class GetCompanyModulesQueryHandler(
    ICompanyModuleAccessRepository accessRepository,
    IModuleRepository moduleRepository)
    : IRequestHandler<GetCompanyModulesQuery, Result<CompanyModulesResult>>
{
    public async Task<Result<CompanyModulesResult>> Handle(GetCompanyModulesQuery request, CancellationToken ct)
    {
        var granted = await accessRepository.GetByCompanyIdAsync(request.CompanyId, ct);
        var grantedModuleIds = granted.Select(a => a.ModuleId).ToHashSet();

        var allModules = await moduleRepository.GetAllAsync(ct);

        var grantedDtos = allModules
            .Where(m => grantedModuleIds.Contains(m.Id))
            .Select(m => new ModuleDto(m.Id, m.Code, m.Name))
            .ToList();

        var availableDtos = allModules
            .Where(m => !grantedModuleIds.Contains(m.Id) && m.IsActive)
            .Select(m => new ModuleDto(m.Id, m.Code, m.Name))
            .ToList();

        return Result<CompanyModulesResult>.Success(
            new CompanyModulesResult(request.CompanyId, grantedDtos, availableDtos));
    }
}
