using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.Domain.ERP.Services;
using Backend.SharedKernel;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Backend.Application.ERP.Commands.Transfers;

public sealed record CreateTransferCommand(
    Guid CompanyId, Guid UserId, Guid FromWarehouseId, Guid ToWarehouseId,
    string? Notes, List<CreateTransferItemCommand> Items) : IRequest<Result<Guid>>;

public sealed record CreateTransferItemCommand(Guid ProductId, decimal Quantity, decimal? UnitCost);

public sealed record CompleteTransferCommand(Guid Id, Guid CompanyId, Guid UserId) : IRequest<Result>;

public sealed record CancelTransferCommand(Guid Id, Guid CompanyId) : IRequest<Result>;

public sealed class CreateTransferCommandHandler(
    ITransferRepository transferRepository,
    IStockRepository stockRepository,
    IStockMovementRepository movementRepository,
    IKardexEntryRepository kardexRepository,
    IRedisStockCache stockCache,
    IStockLockService lockService)
    : IRequestHandler<CreateTransferCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateTransferCommand request, CancellationToken ct)
    {
        var transfer = new Transfer(Guid.NewGuid(), request.CompanyId,
            request.FromWarehouseId, request.ToWarehouseId, request.Notes?.Trim(), request.UserId);

        foreach (var item in request.Items)
        {
            transfer.Items.Add(new TransferItem(
                Guid.NewGuid(), transfer.Id, item.ProductId, item.Quantity, item.UnitCost));
        }

        await transferRepository.AddAsync(transfer, ct);
        return Result<Guid>.Success(transfer.Id);
    }
}

public sealed class CompleteTransferCommandHandler(
    ITransferRepository transferRepository,
    IStockRepository stockRepository,
    IStockMovementRepository movementRepository,
    IKardexEntryRepository kardexRepository,
    IRedisStockCache stockCache,
    IStockLockService lockService,
    ILogger<CompleteTransferCommandHandler> logger)
    : IRequestHandler<CompleteTransferCommand, Result>
{
    public async Task<Result> Handle(CompleteTransferCommand request, CancellationToken ct)
    {
        var transfer = await transferRepository.GetWithItemsAsync(request.Id, ct);
        if (transfer is null || transfer.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("transfer.notfound", "Transferencia no encontrada."));
        if (transfer.Status != "PENDING")
            return Result.Failure(Error.Conflict("transfer.already_completed", "La transferencia ya fue procesada."));

        foreach (var item in transfer.Items)
        {
            // Salida del almacén origen
            var outResult = await ProcessMovement(request.CompanyId, request.UserId, item.ProductId,
                transfer.FromWarehouseId, transfer.ToWarehouseId, "TRANSFER_OUT", item.Quantity, item.UnitCost,
                "TRANSFER", transfer.Id, ct);

            if (outResult.IsFailure)
                return outResult;

            // Entrada al almacén destino
            var inResult = await ProcessMovement(request.CompanyId, request.UserId, item.ProductId,
                transfer.ToWarehouseId, transfer.FromWarehouseId, "TRANSFER_IN", item.Quantity, item.UnitCost,
                "TRANSFER", transfer.Id, ct);

            if (inResult.IsFailure)
                return inResult;
        }

        transfer.Complete(request.UserId);
        transferRepository.Update(transfer);
        return Result.Success();
    }

    private async Task<Result> ProcessMovement(Guid companyId, Guid userId, Guid productId,
        Guid warehouseId, Guid targetWarehouseId, string movementType, decimal quantity, decimal? unitCost,
        string referenceType, Guid referenceId, CancellationToken ct)
    {
        var lockKey = $"{productId}:{warehouseId}";
        var acquired = await lockService.AcquireLockAsync(lockKey, TimeSpan.FromSeconds(10));
        if (!acquired)
            return Result.Failure(Error.Conflict("stock.locked",
                $"El stock del producto {productId} está siendo actualizado por otro proceso."));
        try
        {
            var movement = new StockMovement(Guid.NewGuid(), companyId, productId, warehouseId,
                movementType, quantity, unitCost, referenceType, referenceId, null, userId,
                targetWarehouseId);
            await movementRepository.AddAsync(movement, ct);

            var stock = await stockRepository.GetByProductAndWarehouseAsync(companyId, productId, warehouseId, ct)
                        ?? new Backend.Domain.ERP.Entities.Stock(Guid.NewGuid(), companyId, productId, warehouseId, 0);

            var prevBalance = stock.Quantity;
            decimal kardexUnitCost, kardexTotalCost;

            if (movementType == "TRANSFER_OUT")
            {
                stock.Decrease(quantity);
                kardexUnitCost = stock.UnitCost ?? 0;
                kardexTotalCost = quantity * kardexUnitCost;

                if (stock.MinStock.HasValue && stock.MinStock > 0 && stock.Quantity <= stock.MinStock)
                    logger.LogWarning(
                        "Stock bajo - Producto {ProductId} en almacén {WarehouseId}: {Quantity} (mínimo {MinStock})",
                        productId, warehouseId, stock.Quantity, stock.MinStock);
            }
            else
            {
                stock.Increase(quantity);
                kardexUnitCost = unitCost ?? stock.UnitCost ?? 0;
                kardexTotalCost = quantity * kardexUnitCost;
                if (unitCost.HasValue)
                    stock.RecalculateAverageCost(quantity, unitCost.Value);
            }

            var kardex = new KardexEntry(Guid.NewGuid(), companyId, productId, warehouseId,
                movementType, movementType == "TRANSFER_IN" ? quantity : 0,
                movementType == "TRANSFER_OUT" ? quantity : 0,
                stock.Quantity, prevBalance, kardexUnitCost, kardexTotalCost,
                referenceType, referenceId, null, userId);
            await kardexRepository.AddAsync(kardex, ct);

            await stockCache.SetStockAsync(companyId, warehouseId, productId, stock.Quantity);
            await stockCache.PublishStockUpdateAsync(companyId, warehouseId, productId, stock.Quantity);
            return Result.Success();
        }
        finally
        {
            await lockService.ReleaseLockAsync(lockKey);
        }
    }
}

public sealed class CancelTransferCommandHandler(ITransferRepository transferRepository)
    : IRequestHandler<CancelTransferCommand, Result>
{
    public async Task<Result> Handle(CancelTransferCommand request, CancellationToken ct)
    {
        var transfer = await transferRepository.GetByIdAsync(request.Id, ct);
        if (transfer is null || transfer.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("transfer.notfound", "Transferencia no encontrada."));
        if (transfer.Status != "PENDING")
            return Result.Failure(Error.Conflict("transfer.already_completed", "No se puede cancelar una transferencia ya procesada."));

        transfer.Cancel();
        transferRepository.Update(transfer);
        return Result.Success();
    }
}
