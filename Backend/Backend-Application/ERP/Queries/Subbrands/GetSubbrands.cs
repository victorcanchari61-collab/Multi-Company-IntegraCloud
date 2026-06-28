using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Subbrands;

public sealed record GetSubbrandsQuery(Guid CompanyId, Guid? BrandId = null) : IRequest<Result<List<SubbrandDto>>>;

public sealed class GetSubbrandsQueryHandler(ISubbrandRepository repository)
    : IRequestHandler<GetSubbrandsQuery, Result<List<SubbrandDto>>>
{
    public async Task<Result<List<SubbrandDto>>> Handle(GetSubbrandsQuery request, CancellationToken ct)
    {
        var subbrands = await repository.GetByCompanyAsync(request.CompanyId, ct);

        if (request.BrandId.HasValue)
            subbrands = subbrands.Where(s => s.BrandId == request.BrandId.Value).ToList();

        var dtos = subbrands
            .Select(s => new SubbrandDto(s.Id, s.BrandId, s.Brand.Name, s.Name, s.Description, s.IsActive))
            .ToList();
        return Result<List<SubbrandDto>>.Success(dtos);
    }
}
