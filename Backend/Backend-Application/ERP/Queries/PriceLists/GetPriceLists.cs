using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.PriceLists;

public sealed record GetPriceListsQuery(Guid CompanyId) : IRequest<Result<List<PriceListDto>>>;

public sealed class GetPriceListsQueryHandler(IPriceListRepository repository)
    : IRequestHandler<GetPriceListsQuery, Result<List<PriceListDto>>>
{
    public async Task<Result<List<PriceListDto>>> Handle(GetPriceListsQuery request, CancellationToken ct)
    {
        var lists = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = lists.Select(l => new PriceListDto(l.Id, l.Name, l.Description, l.Type, l.IsActive)).ToList();
        return Result<List<PriceListDto>>.Success(dtos);
    }
}
