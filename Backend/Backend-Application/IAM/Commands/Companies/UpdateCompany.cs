using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Companies;

public sealed record UpdateCompanyCommand(
    Guid Id,
    string Name,
    string? LegalName,
    string? LogoUrl,
    string? Email,
    string? Phone,
    string? Website,
    string? Address,
    string? TaxId,
    string? TaxAddress,
    string? EconomicActivity,
    int TaxpayerType = 1,
    bool AccountingRequired = false,
    string SettlementCurrency = "PEN")
    : IRequest<Result>;

public sealed class UpdateCompanyCommandHandler(ICompanyRepository companyRepository)
    : IRequestHandler<UpdateCompanyCommand, Result>
{
    public async Task<Result> Handle(UpdateCompanyCommand request, CancellationToken ct)
    {
        var company = await companyRepository.GetByIdAsync(request.Id, ct);
        if (company is null)
            return Result.Failure(Error.NotFound("company.not_found", "Company not found."));

        if (request.TaxId is not null)
        {
            var existing = await companyRepository.GetByTaxIdAsync(request.TaxId, ct);
            if (existing is not null && existing.Id != request.Id)
                return Result.Failure(
                    Error.Conflict("company.tax_id_exists", "A company with this Tax ID already exists."));
        }

        company.Update(
            request.Name,
            request.LegalName,
            request.LogoUrl,
            request.Email,
            request.Phone,
            request.Website,
            request.Address,
            request.TaxId,
            request.TaxAddress,
            request.EconomicActivity,
            request.TaxpayerType,
            request.AccountingRequired,
            request.SettlementCurrency);

        companyRepository.Update(company);

        return Result.Success();
    }
}
