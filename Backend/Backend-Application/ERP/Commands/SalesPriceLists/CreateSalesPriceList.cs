using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.SalesPriceLists;

public sealed record CreateSalesPriceListCommand(
    Guid CompanyId, string Code, string Name, string? Currency,
    List<CreateSalesPriceListItemCommand> Items) : IRequest<Result<Guid>>;

public sealed record CreateSalesPriceListItemCommand(Guid ProductId, decimal UnitPrice);

public sealed class CreateSalesPriceListCommandHandler(ISalesPriceListRepository repository)
    : IRequestHandler<CreateSalesPriceListCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateSalesPriceListCommand request, CancellationToken ct)
    {
        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code, null, ct))
            return Result<Guid>.Failure(Error.Conflict("sales_price_list.duplicate_code",
                $"Ya existe una lista de precios con el código '{request.Code}'."));

        var priceList = new SalesPriceList(Guid.NewGuid(), request.CompanyId, request.Code, request.Name, request.Currency);
        foreach (var item in request.Items)
            priceList.AddItem(item.ProductId, item.UnitPrice);

        await repository.AddAsync(priceList, ct);
        return Result<Guid>.Success(priceList.Id);
    }
}
