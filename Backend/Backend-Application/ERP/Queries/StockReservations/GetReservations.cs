using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.StockReservations;

public sealed record GetReservationsQuery(Guid CompanyId, Guid? WarehouseId) : IRequest<Result<List<StockReservationDto>>>;

public sealed class GetReservationsQueryHandler(IStockReservationRepository repository)
    : IRequestHandler<GetReservationsQuery, Result<List<StockReservationDto>>>
{
    public async Task<Result<List<StockReservationDto>>> Handle(GetReservationsQuery request, CancellationToken ct)
    {
        List<Domain.ERP.Entities.StockReservation> reservations;

        if (request.WarehouseId.HasValue)
            reservations = await repository.GetActiveByWarehouseAsync(request.CompanyId, request.WarehouseId.Value, ct);
        else
            reservations = await repository.GetActiveByWarehouseAsync(request.CompanyId, Guid.Empty, ct); // all

        var dtos = reservations.Select(r => new StockReservationDto(
            r.Id, r.ProductId, r.Product?.Name ?? "", r.Product?.Sku,
            r.WarehouseId, r.Warehouse?.Name ?? "",
            r.Quantity, r.Status, r.ReferenceType, r.ReferenceId,
            r.Notes, r.CreatedAt)).ToList();
        return Result<List<StockReservationDto>>.Success(dtos);
    }
}
