using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Companies;

public sealed record RevokeCompanyModuleAccessCommand(
    Guid CompanyId,
    Guid[] ModuleIds) : IRequest<Result>;

public sealed class RevokeCompanyModuleAccessCommandHandler(
    ICompanyModuleAccessRepository accessRepository)
    : IRequestHandler<RevokeCompanyModuleAccessCommand, Result>
{
    public async Task<Result> Handle(RevokeCompanyModuleAccessCommand request, CancellationToken ct)
    {
        var accesses = await accessRepository.GetByCompanyIdAsync(request.CompanyId, ct);
        var toRemove = accesses.Where(a => request.ModuleIds.Contains(a.ModuleId)).ToList();

        foreach (var access in toRemove)
            accessRepository.Delete(access);

        return Result.Success();
    }
}
