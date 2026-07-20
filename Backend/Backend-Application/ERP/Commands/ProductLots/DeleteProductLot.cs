using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.ProductLots;

public sealed record DeleteProductLotCommand(Guid Id) : IRequest<Result>;

public sealed class DeleteProductLotCommandHandler(IProductLotRepository repository)
    : IRequestHandler<DeleteProductLotCommand, Result>
{
    public async Task<Result> Handle(DeleteProductLotCommand request, CancellationToken ct)
    {
        var lot = await repository.GetByIdAsync(request.Id, ct);
        if (lot is null)
            return Result.Failure(Error.NotFound("lot.notfound", "Lote no encontrado."));

        repository.Delete(lot);
        return Result.Success();
    }
}
