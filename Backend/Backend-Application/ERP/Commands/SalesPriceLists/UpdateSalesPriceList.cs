using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.SalesPriceLists;

public sealed record UpdateSalesPriceListCommand(
    Guid Id, Guid CompanyId, string Code, string Name, string? Currency,
    List<UpdateSalesPriceListItemCommand> Items) : IRequest<Result>;

public sealed record UpdateSalesPriceListItemCommand(Guid ProductId, decimal UnitPrice);

public sealed class UpdateSalesPriceListCommandHandler(ISalesPriceListRepository repository)
    : IRequestHandler<UpdateSalesPriceListCommand, Result>
{
    public async Task<Result> Handle(UpdateSalesPriceListCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("sales_price_list.not_found", "Lista de precios no encontrada."));

        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code, request.Id, ct))
            return Result.Failure(Error.Conflict("sales_price_list.duplicate_code",
                $"Ya existe una lista de precios con el código '{request.Code}'."));

        entity.Update(request.Code, request.Name, request.Currency);
        entity.ClearItems();
        foreach (var item in request.Items)
            entity.AddItem(item.ProductId, item.UnitPrice);

        repository.Update(entity);
        return Result.Success();
    }
}
