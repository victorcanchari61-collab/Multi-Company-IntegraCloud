using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Locations;

public sealed record GetLocationsByWarehouseQuery(Guid CompanyId, Guid WarehouseId) : IRequest<Result<List<LocationDto>>>;

public sealed class GetLocationsByWarehouseQueryHandler(ILocationRepository repository)
    : IRequestHandler<GetLocationsByWarehouseQuery, Result<List<LocationDto>>>
{
    public async Task<Result<List<LocationDto>>> Handle(GetLocationsByWarehouseQuery request, CancellationToken ct)
    {
        var locations = await repository.GetTreeAsync(request.CompanyId, request.WarehouseId, ct);
        var dtos = locations.Select(l => new LocationDto(
            l.Id, l.WarehouseId, l.Warehouse?.Name ?? "", l.Code, l.Description,
            l.Zone, l.ParentId, l.Parent?.Code, l.IsActive)).ToList();
        return Result<List<LocationDto>>.Success(dtos);
    }
}
