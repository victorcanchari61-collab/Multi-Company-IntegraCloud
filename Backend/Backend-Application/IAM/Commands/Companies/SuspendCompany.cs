using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Companies;

public sealed record SuspendCompanyCommand(Guid CompanyId) : IRequest<Result>;

public sealed class SuspendCompanyCommandHandler(ICompanyRepository companyRepository)
    : IRequestHandler<SuspendCompanyCommand, Result>
{
    public async Task<Result> Handle(SuspendCompanyCommand request, CancellationToken ct)
    {
        var company = await companyRepository.GetByIdAsync(request.CompanyId, ct);
        if (company is null)
            return Result.Failure(Error.NotFound("company.not_found", "Company not found."));

        company.Suspend();
        return Result.Success();
    }
}
