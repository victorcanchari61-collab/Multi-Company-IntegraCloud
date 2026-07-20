using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Domain.ERP.Services;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PhysicalCounts;

public sealed record ApprovePhysicalCountCommand(Guid Id, Guid CompanyId, Guid UserId) : IRequest<Result>;

public sealed class ApprovePhysicalCountCommandHandler(
    IPhysicalCountRepository countRepository,
    IStockRepository stockRepository,
    IStockMovementRepository movementRepository,
    IKardexEntryRepository kardexRepository,
    IRedisStockCache stockCache,
    IStockLockService lockService)
    : IRequestHandler<ApprovePhysicalCountCommand, Result>
{
    public async Task<Result> Handle(ApprovePhysicalCountCommand request, CancellationToken ct)
    {
        var count = await countRepository.GetWithLinesAsync(request.Id, ct);
        if (count is null || count.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("count.notfound", "Conteo no encontrado."));
        if (count.Status != "COMPLETED")
            return Result.Failure(Error.Conflict("count.not_completed", "El conteo debe estar completado para aprobarse."));

        foreach (var line in count.Lines.Where(l => l.Difference != 0))
        {
            var lockKey = $"{line.ProductId}:{count.WarehouseId}";
            var acquired = await lockService.AcquireLockAsync(lockKey, TimeSpan.FromSeconds(10));
            if (!acquired)
                return Result.Failure(Error.Conflict("stock.locked",
                    $"El stock del producto {line.ProductId} está siendo actualizado por otro proceso."));

            try
            {
                var movementType = line.Difference > 0 ? "ADJUSTMENT_POSITIVE" : "ADJUSTMENT_NEGATIVE";
                var qty = Math.Abs(line.Difference);

                var movement = new StockMovement(Guid.NewGuid(), request.CompanyId, line.ProductId,
                    count.WarehouseId, movementType, qty, null, "PHYSICAL_COUNT", count.Id,
                    $"Conteo físico: esperado {line.ExpectedQuantity}, contado {line.CountedQuantity}", request.UserId);
                await movementRepository.AddAsync(movement, ct);

                var stock = await stockRepository.GetByProductAndWarehouseAsync(
                    request.CompanyId, line.ProductId, count.WarehouseId, ct);

                if (stock is null)
                {
                    stock = new Backend.Domain.ERP.Entities.Stock(Guid.NewGuid(), request.CompanyId, line.ProductId, count.WarehouseId, 0);
                    await stockRepository.AddAsync(stock, ct);
                }

                var prevBalance = stock.Quantity;
                decimal qtyIn = 0, qtyOut = 0;
                if (line.Difference > 0) { stock.Increase(qty); qtyIn = qty; }
                else { stock.Decrease(qty); qtyOut = qty; }

                var kardex = new KardexEntry(Guid.NewGuid(), request.CompanyId, line.ProductId,
                    count.WarehouseId, movementType, qtyIn, qtyOut, stock.Quantity,
                    prevBalance, stock.UnitCost, qty * (stock.UnitCost ?? 0),
                    "PHYSICAL_COUNT", count.Id, line.Notes, request.UserId);
                await kardexRepository.AddAsync(kardex, ct);

                await stockCache.SetStockAsync(request.CompanyId, count.WarehouseId, line.ProductId, stock.Quantity);
                await stockCache.PublishStockUpdateAsync(request.CompanyId, count.WarehouseId, line.ProductId, stock.Quantity);
            }
            finally
            {
                await lockService.ReleaseLockAsync(lockKey);
            }
        }

        count.Approve(request.UserId);
        return Result.Success();
    }
}
