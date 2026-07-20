using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.ProductPrices;

public sealed record GetProductPricesQuery(Guid ProductId) : IRequest<Result<List<ProductPriceDto>>>;

public sealed class GetProductPricesQueryHandler(IProductPriceRepository repository)
    : IRequestHandler<GetProductPricesQuery, Result<List<ProductPriceDto>>>
{
    public async Task<Result<List<ProductPriceDto>>> Handle(GetProductPricesQuery request, CancellationToken ct)
    {
        var prices = await repository.GetByProductAsync(request.ProductId, ct);
        var dtos = prices.Select(p => new ProductPriceDto(
            p.Id, p.ProductId, p.PresentationId, p.Presentation?.Name,
            p.PriceListId, p.PriceList?.Name,
            p.CurrencyId, p.Currency?.Code,
            p.PurchasePrice, p.SalePrice
        )).ToList();
        return Result<List<ProductPriceDto>>.Success(dtos);
    }
}
