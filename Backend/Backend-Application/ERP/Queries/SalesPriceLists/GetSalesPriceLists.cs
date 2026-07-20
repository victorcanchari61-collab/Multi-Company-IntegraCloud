using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.SalesPriceLists;

public sealed record GetSalesPriceListsQuery(Guid CompanyId) : IRequest<Result<List<SalesPriceListDto>>>;

public sealed class GetSalesPriceListsQueryHandler(ISalesPriceListRepository repository)
    : IRequestHandler<GetSalesPriceListsQuery, Result<List<SalesPriceListDto>>>
{
    public async Task<Result<List<SalesPriceListDto>>> Handle(GetSalesPriceListsQuery request, CancellationToken ct)
    {
        var list = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = list.Select(pl => new SalesPriceListDto(
            pl.Id, pl.Code, pl.Name, pl.Currency, pl.IsActive,
            pl.Items.Select(i => new SalesPriceListItemDto(i.Id, i.ProductId, "", i.UnitPrice)).ToList())).ToList();
        return Result<List<SalesPriceListDto>>.Success(dtos);
    }
}
