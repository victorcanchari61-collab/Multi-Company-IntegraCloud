using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Companies;

public sealed record GetCompanyBrandingQuery(string Slug) : IRequest<Result<CompanyBrandingDto>>;

public sealed class GetCompanyBrandingQueryHandler(ICompanyRepository companyRepository)
    : IRequestHandler<GetCompanyBrandingQuery, Result<CompanyBrandingDto>>
{
    public async Task<Result<CompanyBrandingDto>> Handle(GetCompanyBrandingQuery request, CancellationToken ct)
    {
        var company = await companyRepository.GetBySlugAsync(request.Slug, ct);
        if (company is null)
            return Result<CompanyBrandingDto>.Failure(
                Error.NotFound("company.not_found", "Company not found."));

        return Result<CompanyBrandingDto>.Success(
            new CompanyBrandingDto(company.Slug, company.Name, company.LogoUrl));
    }
}
