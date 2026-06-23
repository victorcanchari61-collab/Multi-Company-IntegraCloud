using Backend.Application.IAM.DTOs;
using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Companies;

public sealed record GetCompaniesQuery(
    int Page = 1,
    int Size = 20,
    int? Status = null) : IRequest<Result<PagedResult<CompanyDto>>>;

public sealed class GetCompaniesQueryHandler(ICompanyRepository companyRepository)
    : IRequestHandler<GetCompaniesQuery, Result<PagedResult<CompanyDto>>>
{
    public async Task<Result<PagedResult<CompanyDto>>> Handle(GetCompaniesQuery request, CancellationToken ct)
    {
        var all = await companyRepository.GetAllAsync(ct);

        var filtered = request.Status.HasValue
            ? all.Where(c => c.Status == request.Status.Value).ToList()
            : all;

        var paged = filtered
            .Skip((request.Page - 1) * request.Size)
            .Take(request.Size)
            .Select(c => new CompanyDto(c.Id, c.Name, c.Slug, c.LegalName, c.LogoUrl, c.Email, c.Phone, c.Website,
                c.Address, c.TaxId, c.TaxAddress, c.EconomicActivity, c.TaxpayerType,
                c.AccountingRequired, c.SettlementCurrency, c.Status, c.CreatedAt))
            .ToList();

        return Result<PagedResult<CompanyDto>>.Success(
            new PagedResult<CompanyDto>(paged, filtered.Count, request.Page, request.Size));
    }
}
