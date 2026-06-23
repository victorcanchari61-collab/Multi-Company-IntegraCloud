using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Companies;

public sealed record ActivateCompanyCommand(Guid CompanyId) : IRequest<Result>;

public sealed class ActivateCompanyCommandHandler(ICompanyRepository companyRepository)
    : IRequestHandler<ActivateCompanyCommand, Result>
{
    public async Task<Result> Handle(ActivateCompanyCommand request, CancellationToken ct)
    {
        var company = await companyRepository.GetByIdAsync(request.CompanyId, ct);
        if (company is null)
            return Result.Failure(Error.NotFound("company.not_found", "Company not found."));

        company.Activate();
        return Result.Success();
    }
}
