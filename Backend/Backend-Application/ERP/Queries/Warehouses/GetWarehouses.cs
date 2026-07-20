using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Warehouses;

public sealed record GetWarehousesQuery(Guid CompanyId) : IRequest<Result<List<WarehouseDto>>>;

public sealed class GetWarehousesQueryHandler(IWarehouseRepository repository)
    : IRequestHandler<GetWarehousesQuery, Result<List<WarehouseDto>>>
{
    public async Task<Result<List<WarehouseDto>>> Handle(GetWarehousesQuery request, CancellationToken ct)
    {
        var warehouses = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = warehouses.Select(w => new WarehouseDto(
            w.Id, w.Code, w.Name, w.Type, w.Location, w.IsActive)).ToList();
        return Result<List<WarehouseDto>>.Success(dtos);
    }
}
