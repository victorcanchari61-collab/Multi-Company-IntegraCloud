using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Companies;

public sealed record GrantCompanySystemAccessCommand(
    Guid CompanyId,
    Guid[] SystemIds,
    Guid GrantedBy) : IRequest<Result>;

public sealed class GrantCompanySystemAccessCommandHandler(
    ICompanySystemAccessRepository accessRepository,
    ICompanyRepository companyRepository,
    ISystemRepository systemRepository)
    : IRequestHandler<GrantCompanySystemAccessCommand, Result>
{
    public async Task<Result> Handle(GrantCompanySystemAccessCommand request, CancellationToken ct)
    {
        var company = await companyRepository.GetByIdAsync(request.CompanyId, ct);
        if (company is null)
            return Result.Failure(Error.NotFound("company.not_found", "Company not found."));

        foreach (var systemId in request.SystemIds)
        {
            var system = await systemRepository.GetByIdAsync(systemId, ct);
            if (system is null)
                return Result.Failure(Error.NotFound("system.not_found", $"System {systemId} not found."));

            if (!await accessRepository.HasAccessAsync(request.CompanyId, systemId, ct))
            {
                var access = new CompanySystemAccess(
                    Guid.NewGuid(), request.CompanyId, systemId, request.GrantedBy);
                await accessRepository.AddAsync(access, ct);
            }
        }

        return Result.Success();
    }
}
