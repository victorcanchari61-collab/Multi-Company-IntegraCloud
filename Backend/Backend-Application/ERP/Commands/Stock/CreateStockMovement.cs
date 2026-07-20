using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Events;
using Backend.Domain.ERP.Repositories;
using Backend.Domain.ERP.Services;
using Backend.SharedKernel;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Backend.Application.ERP.Commands.Stock;

public sealed record CreateStockMovementCommand(
    Guid CompanyId, Guid UserId, Guid ProductId, Guid WarehouseId,
    string MovementType, decimal Quantity, decimal? UnitCost,
    string? ReferenceType, Guid? ReferenceId, string? Notes) : IRequest<Result>;

public sealed class CreateStockMovementCommandHandler(
    IStockRepository stockRepository,
    IStockMovementRepository movementRepository,
    IKardexEntryRepository kardexRepository,
    IRedisStockCache stockCache,
    IStockLockService lockService,
    ILogger<CreateStockMovementCommandHandler> logger)
    : IRequestHandler<CreateStockMovementCommand, Result>
{
    public async Task<Result> Handle(CreateStockMovementCommand request, CancellationToken ct)
    {
        var lockKey = $"{request.ProductId}:{request.WarehouseId}";
        var acquired = await lockService.AcquireLockAsync(lockKey, TimeSpan.FromSeconds(10));
        if (!acquired)
            return Result.Failure(Error.Conflict("stock.locked", "El stock está siendo actualizado por otro proceso."));

        try
        {
            var movement = new StockMovement(
                Guid.NewGuid(), request.CompanyId, request.ProductId, request.WarehouseId,
                request.MovementType, request.Quantity, request.UnitCost,
                request.ReferenceType, request.ReferenceId, request.Notes, request.UserId);

            await movementRepository.AddAsync(movement, ct);

            var stock = await stockRepository.GetByProductAndWarehouseAsync(
                request.CompanyId, request.ProductId, request.WarehouseId, ct);

            if (stock is null)
            {
                stock = new Backend.Domain.ERP.Entities.Stock(Guid.NewGuid(), request.CompanyId, request.ProductId,
                    request.WarehouseId, 0);
                await stockRepository.AddAsync(stock, ct);
            }

            var previousBalance = stock.Quantity;
            decimal quantityIn = 0, quantityOut = 0;
            decimal kardexUnitCost = request.UnitCost ?? stock.UnitCost ?? 0;
            decimal kardexTotalCost = 0;

            switch (request.MovementType)
            {
                case "PURCHASE_IN":
                case "SALE_RETURN":
                    stock.Increase(request.Quantity);
                    quantityIn = request.Quantity;
                    kardexUnitCost = request.UnitCost ?? 0;
                    kardexTotalCost = quantityIn * kardexUnitCost;
                    if (request.UnitCost.HasValue)
                        stock.RecalculateAverageCost(request.Quantity, request.UnitCost.Value);
                    break;

                case "TRANSFER_IN":
                    stock.Increase(request.Quantity);
                    quantityIn = request.Quantity;
                    kardexUnitCost = request.UnitCost ?? stock.UnitCost ?? 0;
                    kardexTotalCost = quantityIn * kardexUnitCost;
                    if (request.UnitCost.HasValue)
                        stock.RecalculateAverageCost(request.Quantity, request.UnitCost.Value);
                    break;

                case "ADJUSTMENT_POSITIVE":
                    stock.Increase(request.Quantity);
                    quantityIn = request.Quantity;
                    kardexUnitCost = stock.UnitCost ?? 0;
                    kardexTotalCost = quantityIn * kardexUnitCost;
                    if (stock.UnitCost is null && request.UnitCost.HasValue)
                        stock.SetCost(request.UnitCost.Value);
                    break;

                case "SALE_OUT":
                case "TRANSFER_OUT":
                case "PURCHASE_RETURN":
                    stock.Decrease(request.Quantity);
                    quantityOut = request.Quantity;
                    kardexUnitCost = stock.UnitCost ?? 0;
                    kardexTotalCost = quantityOut * kardexUnitCost;
                    break;

                case "ADJUSTMENT_NEGATIVE":
                    stock.Decrease(request.Quantity);
                    quantityOut = request.Quantity;
                    kardexUnitCost = stock.UnitCost ?? 0;
                    kardexTotalCost = quantityOut * kardexUnitCost;
                    if (stock.Quantity == 0)
                        stock.SetCost(0);
                    break;

                default:
                    return Result.Failure(Error.Validation("movement.invalid_type",
                        $"Tipo de movimiento inválido: {request.MovementType}"));
            }

            var kardex = new KardexEntry(
                Guid.NewGuid(), request.CompanyId, request.ProductId, request.WarehouseId,
                request.MovementType, quantityIn, quantityOut, stock.Quantity,
                previousBalance, kardexUnitCost, kardexTotalCost,
                request.ReferenceType, request.ReferenceId, request.Notes, request.UserId);

            await kardexRepository.AddAsync(kardex, ct);

            // Alerta de reposición si el stock cayó por debajo del mínimo
            if (quantityOut > 0 && stock.MinStock.HasValue && stock.MinStock > 0 && stock.Quantity <= stock.MinStock)
                logger.LogWarning(
                    "Stock bajo - Producto {ProductId} en almacén {WarehouseId}: {Quantity} (mínimo {MinStock})",
                    request.ProductId, request.WarehouseId, stock.Quantity, stock.MinStock);

            // Actualizar Redis cache y publicar evento
            await stockCache.SetStockAsync(request.CompanyId, request.WarehouseId, request.ProductId, stock.Quantity);
            await stockCache.PublishStockUpdateAsync(request.CompanyId, request.WarehouseId, request.ProductId, stock.Quantity);

            return Result.Success();
        }
        finally
        {
            await lockService.ReleaseLockAsync(lockKey);
        }
    }
}
