using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.SalesPriceLists;

public sealed record SetSalesPriceListStatusCommand(Guid Id, Guid CompanyId, bool IsActive) : IRequest<Result>;

public sealed class SetSalesPriceListStatusCommandHandler(ISalesPriceListRepository repository)
    : IRequestHandler<SetSalesPriceListStatusCommand, Result>
{
    public async Task<Result> Handle(SetSalesPriceListStatusCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("sales_price_list.not_found", "Lista de precios no encontrada."));

        if (request.IsActive) entity.Activate(); else entity.Deactivate();
        return Result.Success();
    }
}
