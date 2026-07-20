using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Companies;

public sealed record RevokeCompanySystemAccessCommand(Guid CompanyId, Guid SystemId) : IRequest<Result>;

public sealed class RevokeCompanySystemAccessCommandHandler(
    ICompanySystemAccessRepository systemAccessRepository,
    ICompanyModuleAccessRepository moduleAccessRepository,
    IModuleRepository moduleRepository)
    : IRequestHandler<RevokeCompanySystemAccessCommand, Result>
{
    public async Task<Result> Handle(RevokeCompanySystemAccessCommand request, CancellationToken ct)
    {
        var access = await systemAccessRepository.GetByCompanyAndSystemAsync(request.CompanyId, request.SystemId, ct);
        if (access is null)
            return Result.Success(); // nada que revocar

        // Revocar también los módulos de ese sistema para la empresa.
        var systemModuleIds = (await moduleRepository.GetBySystemIdAsync(request.SystemId, ct))
            .Select(m => m.Id)
            .ToHashSet();

        var moduleAccesses = await moduleAccessRepository.GetByCompanyIdAsync(request.CompanyId, ct);
        foreach (var ma in moduleAccesses.Where(m => systemModuleIds.Contains(m.ModuleId)))
            moduleAccessRepository.Delete(ma);

        systemAccessRepository.Delete(access);

        return Result.Success();
    }
}
