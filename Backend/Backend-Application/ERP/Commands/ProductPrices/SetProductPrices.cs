using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.ProductPrices;

public sealed record ProductPriceEntry(
    Guid PresentationId, Guid PriceListId, Guid CurrencyId, decimal? PurchasePrice, decimal? SalePrice);

public sealed record SetProductPricesCommand(Guid CompanyId, Guid ProductId, List<ProductPriceEntry> Prices)
    : IRequest<Result>;

public sealed class SetProductPricesCommandHandler(
    IProductPriceRepository priceRepository,
    IProductRepository productRepository)
    : IRequestHandler<SetProductPricesCommand, Result>
{
    public async Task<Result> Handle(SetProductPricesCommand request, CancellationToken ct)
    {
        var product = await productRepository.GetByIdAsync(request.ProductId, ct);
        if (product is null)
            return Result.Failure(Error.NotFound("product.notfound", "Producto no encontrado."));

        var existing = await priceRepository.GetByProductAsync(request.ProductId, ct);

        foreach (var entry in request.Prices)
        {
            var match = existing.FirstOrDefault(p =>
                p.PresentationId == entry.PresentationId &&
                p.PriceListId == entry.PriceListId &&
                p.CurrencyId == entry.CurrencyId);

            if (match is not null)
            {
                match.UpdatePrices(entry.PurchasePrice, entry.SalePrice);
                priceRepository.Update(match);
            }
            else
            {
                var price = new ProductPrice(
                    Guid.NewGuid(), request.CompanyId, request.ProductId,
                    entry.PresentationId, entry.PriceListId, entry.CurrencyId,
                    entry.PurchasePrice, entry.SalePrice);
                await priceRepository.AddAsync(price, ct);
            }
        }

        return Result.Success();
    }
}
