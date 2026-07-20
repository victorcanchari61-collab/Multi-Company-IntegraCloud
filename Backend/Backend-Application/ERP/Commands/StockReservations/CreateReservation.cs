using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Domain.ERP.Services;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.StockReservations;

public sealed record CreateReservationCommand(
    Guid CompanyId, Guid UserId, Guid ProductId, Guid WarehouseId,
    decimal Quantity, string? ReferenceType, Guid? ReferenceId, string? Notes) : IRequest<Result>;

public sealed class CreateReservationCommandHandler(
    IStockRepository stockRepository,
    IStockReservationRepository reservationRepository,
    IStockLockService lockService)
    : IRequestHandler<CreateReservationCommand, Result>
{
    public async Task<Result> Handle(CreateReservationCommand request, CancellationToken ct)
    {
        var lockKey = $"{request.ProductId}:{request.WarehouseId}";
        var acquired = await lockService.AcquireLockAsync(lockKey, TimeSpan.FromSeconds(10));
        if (!acquired)
            return Result.Failure(Error.Conflict("stock.locked", "El stock está siendo actualizado por otro proceso."));

        try
        {
            var stock = await stockRepository.GetByProductAndWarehouseAsync(
                request.CompanyId, request.ProductId, request.WarehouseId, ct);

            if (stock is null)
                return Result.Failure(Error.NotFound("stock.notfound", "No hay stock de este producto en el almacén."));

            if (stock.Available < request.Quantity)
                return Result.Failure(Error.Conflict("stock.insufficient",
                    $"Stock disponible insuficiente. Disponible: {stock.Available}, solicitado: {request.Quantity}"));

            var reservation = new StockReservation(Guid.NewGuid(), request.CompanyId, request.ProductId,
                request.WarehouseId, request.Quantity, request.ReferenceType, request.ReferenceId,
                request.Notes, request.UserId);

            stock.Reserve(request.Quantity);
            await reservationRepository.AddAsync(reservation, ct);

            return Result.Success();
        }
        finally
        {
            await lockService.ReleaseLockAsync(lockKey);
        }
    }
}
