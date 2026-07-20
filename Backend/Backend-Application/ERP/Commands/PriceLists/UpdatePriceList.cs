using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PriceLists;

public sealed record UpdatePriceListCommand(
    Guid Id, Guid CompanyId, string Name, string? Description, string Type)
    : IRequest<Result>;

public sealed class UpdatePriceListCommandHandler(IPriceListRepository repository)
    : IRequestHandler<UpdatePriceListCommand, Result>
{
    public async Task<Result> Handle(UpdatePriceListCommand request, CancellationToken ct)
    {
        var priceList = await repository.GetByIdAsync(request.Id, ct);
        if (priceList is null)
            return Result.Failure(Error.NotFound("pricelist.notfound", "Lista de precios no encontrada."));

        priceList.Update(request.Name.Trim(), request.Description?.Trim(), request.Type);
        repository.Update(priceList);
        return Result.Success();
    }
}
