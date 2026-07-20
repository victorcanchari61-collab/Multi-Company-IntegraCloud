using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Stock;

public sealed record SetStockLevelsCommand(
    decimal? MinStock, decimal? MaxStock);

public sealed record SetStockLevelsByIdCommand(
    Guid StockId, Guid CompanyId,
    decimal? MinStock, decimal? MaxStock) : IRequest<Result>;

public sealed class SetStockLevelsByIdCommandHandler(IStockRepository repository)
    : IRequestHandler<SetStockLevelsByIdCommand, Result>
{
    public async Task<Result> Handle(SetStockLevelsByIdCommand request, CancellationToken ct)
    {
        var stock = await repository.GetByIdAsync(request.StockId, ct);
        if (stock is null || stock.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("stock.notfound", "Stock no encontrado."));

        stock.SetLevels(request.MinStock, request.MaxStock);
        repository.Update(stock);
        return Result.Success();
    }
}
