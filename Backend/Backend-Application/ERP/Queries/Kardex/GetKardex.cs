using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Kardex;

public sealed record GetKardexByProductQuery(Guid CompanyId, Guid ProductId) : IRequest<Result<List<KardexEntryDto>>>;

public sealed class GetKardexByProductQueryHandler(IKardexEntryRepository repository)
    : IRequestHandler<GetKardexByProductQuery, Result<List<KardexEntryDto>>>
{
    public async Task<Result<List<KardexEntryDto>>> Handle(GetKardexByProductQuery request, CancellationToken ct)
    {
        var entries = await repository.GetByProductAsync(request.CompanyId, request.ProductId, ct);
        var dtos = entries.Select(k => new KardexEntryDto(
            k.Id, k.ProductId, k.Product?.Name,
            k.WarehouseId, k.Warehouse?.Name,
            k.MovementType, k.QuantityIn, k.QuantityOut,
            k.Balance, k.PreviousBalance,
            k.UnitCost, k.TotalCost,
            k.ReferenceType, k.Notes, k.CreatedAt)).ToList();
        return Result<List<KardexEntryDto>>.Success(dtos);
    }
}
