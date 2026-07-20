using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.SalesPriceLists;

public sealed record GetSalesPriceListByIdQuery(Guid Id, Guid CompanyId) : IRequest<Result<SalesPriceListDto>>;

public sealed class GetSalesPriceListByIdQueryHandler(ISalesPriceListRepository repository)
    : IRequestHandler<GetSalesPriceListByIdQuery, Result<SalesPriceListDto>>
{
    public async Task<Result<SalesPriceListDto>> Handle(GetSalesPriceListByIdQuery request, CancellationToken ct)
    {
        var pl = await repository.GetWithItemsAsync(request.Id, ct);
        if (pl == null || pl.CompanyId != request.CompanyId)
            return Result<SalesPriceListDto>.Failure(Error.NotFound("sales_price_list.not_found", "Lista de precios no encontrada."));

        return Result<SalesPriceListDto>.Success(new SalesPriceListDto(
            pl.Id, pl.Code, pl.Name, pl.Currency, pl.IsActive,
            pl.Items.Select(i => new SalesPriceListItemDto(i.Id, i.ProductId, "", i.UnitPrice)).ToList()));
    }
}
