using Backend.Domain.ERP.Repositories;
using Backend.Domain.ERP.Services;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.StockReservations;

public sealed record ReleaseReservationCommand(Guid Id, Guid CompanyId) : IRequest<Result>;

public sealed class ReleaseReservationCommandHandler(
    IStockReservationRepository reservationRepository,
    IStockRepository stockRepository,
    IStockLockService lockService)
    : IRequestHandler<ReleaseReservationCommand, Result>
{
    public async Task<Result> Handle(ReleaseReservationCommand request, CancellationToken ct)
    {
        var reservation = await reservationRepository.GetByIdAsync(request.Id, ct);
        if (reservation is null || reservation.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("reservation.notfound", "Reserva no encontrada."));
        if (reservation.Status != "ACTIVE")
            return Result.Failure(Error.Conflict("reservation.not_active", "La reserva ya fue liberada o cancelada."));

        var lockKey = $"{reservation.ProductId}:{reservation.WarehouseId}";
        var acquired = await lockService.AcquireLockAsync(lockKey, TimeSpan.FromSeconds(10));
        if (!acquired)
            return Result.Failure(Error.Conflict("stock.locked", "El stock está siendo actualizado por otro proceso."));

        try
        {
            var stock = await stockRepository.GetByProductAndWarehouseAsync(
                request.CompanyId, reservation.ProductId, reservation.WarehouseId, ct);

            stock?.Unreserve(reservation.Quantity);
            reservation.Release();

            return Result.Success();
        }
        finally
        {
            await lockService.ReleaseLockAsync(lockKey);
        }
    }
}
