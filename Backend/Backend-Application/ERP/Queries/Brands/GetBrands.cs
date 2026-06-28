using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Brands;

public sealed record GetBrandsQuery(Guid CompanyId) : IRequest<Result<List<BrandDto>>>;

public sealed class GetBrandsQueryHandler(IBrandRepository repository)
    : IRequestHandler<GetBrandsQuery, Result<List<BrandDto>>>
{
    public async Task<Result<List<BrandDto>>> Handle(GetBrandsQuery request, CancellationToken ct)
    {
        var brands = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = brands
            .Select(b => new BrandDto(b.Id, b.Name, b.Description, b.IsActive))
            .ToList();
        return Result<List<BrandDto>>.Success(dtos);
    }
}
