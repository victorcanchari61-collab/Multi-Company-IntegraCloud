using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PriceLists;

public sealed record SetPriceListStatusCommand(Guid Id, bool IsActive) : IRequest<Result>;

public sealed class SetPriceListStatusCommandHandler(IPriceListRepository repository)
    : IRequestHandler<SetPriceListStatusCommand, Result>
{
    public async Task<Result> Handle(SetPriceListStatusCommand request, CancellationToken ct)
    {
        var priceList = await repository.GetByIdAsync(request.Id, ct);
        if (priceList is null)
            return Result.Failure(Error.NotFound("pricelist.notfound", "Lista de precios no encontrada."));

        if (request.IsActive) priceList.Activate();
        else priceList.Deactivate();

        repository.Update(priceList);
        return Result.Success();
    }
}
