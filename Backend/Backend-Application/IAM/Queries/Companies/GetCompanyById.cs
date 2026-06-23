using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Companies;

public sealed record GetCompanyByIdQuery(Guid CompanyId) : IRequest<Result<CompanyDto>>;

public sealed class GetCompanyByIdQueryHandler(ICompanyRepository companyRepository)
    : IRequestHandler<GetCompanyByIdQuery, Result<CompanyDto>>
{
    public async Task<Result<CompanyDto>> Handle(GetCompanyByIdQuery request, CancellationToken ct)
    {
        var company = await companyRepository.GetByIdAsync(request.CompanyId, ct);
        if (company is null)
            return Result<CompanyDto>.Failure(
                Error.NotFound("company.not_found", "Company not found."));

        return Result<CompanyDto>.Success(
            new CompanyDto(company.Id, company.Name, company.Slug, company.LegalName, company.LogoUrl,
                company.Email, company.Phone, company.Website, company.Address,
                company.TaxId, company.TaxAddress, company.EconomicActivity,
                company.TaxpayerType, company.AccountingRequired, company.SettlementCurrency,
                company.Status, company.CreatedAt));
    }
}
