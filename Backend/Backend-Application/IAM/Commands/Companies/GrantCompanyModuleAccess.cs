using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Companies;

public sealed record GrantCompanyModuleAccessCommand(
    Guid CompanyId,
    Guid[] ModuleIds,
    Guid GrantedBy) : IRequest<Result>;

public sealed class GrantCompanyModuleAccessCommandHandler(
    ICompanyModuleAccessRepository accessRepository,
    ICompanyRepository companyRepository,
    IModuleRepository moduleRepository,
    ICompanySystemAccessRepository systemAccessRepository)
    : IRequestHandler<GrantCompanyModuleAccessCommand, Result>
{
    public async Task<Result> Handle(GrantCompanyModuleAccessCommand request, CancellationToken ct)
    {
        var company = await companyRepository.GetByIdAsync(request.CompanyId, ct);
        if (company is null)
            return Result.Failure(Error.NotFound("company.not_found", "Company not found."));

        foreach (var moduleId in request.ModuleIds)
        {
            var module = await moduleRepository.GetByIdAsync(moduleId, ct);
            if (module is null)
                return Result.Failure(Error.NotFound("module.not_found", $"Module {moduleId} not found."));

            // Nivel 1: el sistema del módulo debe estar concedido primero.
            if (!await systemAccessRepository.HasAccessAsync(request.CompanyId, module.SystemId, ct))
                return Result.Failure(Error.Forbidden("system.not_granted",
                    "El sistema de este módulo no está concedido a la empresa."));

            var exists = await accessRepository.HasAccessAsync(request.CompanyId, moduleId, ct);
            if (!exists)
            {
                var access = new CompanyModuleAccess(
                    Guid.NewGuid(), request.CompanyId, moduleId, request.GrantedBy);
                await accessRepository.AddAsync(access, ct);
            }
        }

        return Result.Success();
    }
}
