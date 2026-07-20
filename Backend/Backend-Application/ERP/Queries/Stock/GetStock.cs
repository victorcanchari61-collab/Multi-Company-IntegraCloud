using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Stock;

public sealed record GetStockByWarehouseQuery(Guid CompanyId, Guid WarehouseId) : IRequest<Result<List<StockDto>>>;

public sealed class GetStockByWarehouseQueryHandler(IStockRepository repository)
    : IRequestHandler<GetStockByWarehouseQuery, Result<List<StockDto>>>
{
    public async Task<Result<List<StockDto>>> Handle(GetStockByWarehouseQuery request, CancellationToken ct)
    {
        var stock = await repository.GetByWarehouseAsync(request.CompanyId, request.WarehouseId, ct);
        var dtos = stock.Select(s => new StockDto(
            s.Id, s.ProductId, s.Product?.Name ?? "", s.Product?.Sku,
            s.WarehouseId, s.Warehouse?.Name ?? "",
            s.Quantity, s.ReservedQuantity, s.Available,
            s.UnitCost, s.MinStock, s.MaxStock)).ToList();
        return Result<List<StockDto>>.Success(dtos);
    }
}

public sealed record GetStockValuationQuery(
    Guid CompanyId, Guid? WarehouseId)
    : IRequest<Result<List<StockValuationDto>>>;

public sealed class GetStockValuationQueryHandler(IStockRepository repository)
    : IRequestHandler<GetStockValuationQuery, Result<List<StockValuationDto>>>
{
    public async Task<Result<List<StockValuationDto>>> Handle(GetStockValuationQuery request, CancellationToken ct)
    {
        var stock = request.WarehouseId.HasValue
            ? await repository.GetByWarehouseAsync(request.CompanyId, request.WarehouseId.Value, ct)
            : await repository.GetAllByCompanyAsync(request.CompanyId, ct);

        var dtos = stock
            .Where(s => s.Quantity > 0 || (s.UnitCost.HasValue && s.UnitCost > 0))
            .Select(s => new StockValuationDto(
                s.Id, s.ProductId, s.Product?.Name ?? "", s.Product?.Sku,
                s.WarehouseId, s.Warehouse?.Name ?? "",
                s.Quantity, s.UnitCost,
                Math.Round(s.Quantity * (s.UnitCost ?? 0), 2))).ToList();

        return Result<List<StockValuationDto>>.Success(dtos);
    }
}

public sealed record GetStockLowByMinQuery(Guid CompanyId) : IRequest<Result<List<StockDto>>>;

public sealed class GetStockLowByMinQueryHandler(IStockRepository repository)
    : IRequestHandler<GetStockLowByMinQuery, Result<List<StockDto>>>
{
    public async Task<Result<List<StockDto>>> Handle(GetStockLowByMinQuery request, CancellationToken ct)
    {
        var all = await repository.GetAllByCompanyAsync(request.CompanyId, ct);
        var low = all.Where(s => s.MinStock.HasValue && s.MinStock > 0 && s.Quantity <= s.MinStock).ToList();
        var dtos = low.Select(s => new StockDto(
            s.Id, s.ProductId, s.Product?.Name ?? "", s.Product?.Sku,
            s.WarehouseId, s.Warehouse?.Name ?? "",
            s.Quantity, s.ReservedQuantity, s.Available,
            s.UnitCost, s.MinStock, s.MaxStock)).ToList();
        return Result<List<StockDto>>.Success(dtos);
    }
}

public sealed record GetStockMovementsQuery(
    Guid CompanyId, Guid? WarehouseId, Guid? ProductId)
    : IRequest<Result<List<StockMovementDto>>>;

public sealed class GetStockMovementsQueryHandler(IStockMovementRepository repository)
    : IRequestHandler<GetStockMovementsQuery, Result<List<StockMovementDto>>>
{
    public async Task<Result<List<StockMovementDto>>> Handle(GetStockMovementsQuery request, CancellationToken ct)
    {
        List<Domain.ERP.Entities.StockMovement> movements;
        if (request.WarehouseId.HasValue)
            movements = await repository.GetByWarehouseAsync(request.CompanyId, request.WarehouseId.Value, ct);
        else if (request.ProductId.HasValue)
            movements = await repository.GetByProductAsync(request.CompanyId, request.ProductId.Value, ct);
        else
            movements = await repository.GetAllAsync(ct);

        var dtos = movements.Select(m => new StockMovementDto(
            m.Id, m.ProductId, m.Product?.Name ?? "", m.Product?.Sku,
            m.WarehouseId, m.Warehouse?.Name ?? "",
            m.MovementType, m.Quantity, m.UnitCost,
            m.ReferenceType, m.ReferenceId, m.Notes, m.CreatedAt)).ToList();
        return Result<List<StockMovementDto>>.Success(dtos);
    }
}
