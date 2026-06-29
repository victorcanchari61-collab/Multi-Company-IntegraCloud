using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.ProductLots;

public sealed record UpdateProductLotCommand(
    Guid Id, Guid CompanyId, Guid ProductId, string Number, DateOnly? ExpiryDate, decimal InitialStock)
    : IRequest<Result>;

public sealed class UpdateProductLotCommandHandler(IProductLotRepository repository)
    : IRequestHandler<UpdateProductLotCommand, Result>
{
    public async Task<Result> Handle(UpdateProductLotCommand request, CancellationToken ct)
    {
        var lot = await repository.GetByIdAsync(request.Id, ct);
        if (lot is null)
            return Result.Failure(Error.NotFound("lot.notfound", "Lote no encontrado."));

        lot.Update(request.Number.Trim(), request.ExpiryDate, request.InitialStock);
        repository.Update(lot);
        return Result.Success();
    }
}
