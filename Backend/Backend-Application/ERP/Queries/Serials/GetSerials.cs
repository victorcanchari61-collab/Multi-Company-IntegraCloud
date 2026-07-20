using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Serials;

public sealed record GetSerialsByProductQuery(Guid CompanyId, Guid ProductId) : IRequest<Result<List<SerialNumberDto>>>;
public sealed record GetSerialsByWarehouseQuery(Guid CompanyId, Guid WarehouseId) : IRequest<Result<List<SerialNumberDto>>>;

public sealed class GetSerialsByProductQueryHandler(ISerialNumberRepository repository)
    : IRequestHandler<GetSerialsByProductQuery, Result<List<SerialNumberDto>>>
{
    public async Task<Result<List<SerialNumberDto>>> Handle(GetSerialsByProductQuery request, CancellationToken ct)
    {
        var serials = await repository.GetByProductAsync(request.CompanyId, request.ProductId, ct);
        var dtos = serials.Select(s => new SerialNumberDto(
            s.Id, s.ProductId, s.Product?.Name ?? "", s.Product?.Sku,
            s.BatchId, s.Batch?.Number, s.Serial, s.Status,
            s.WarehouseId, s.Warehouse?.Name ?? "", s.LocationId)).ToList();
        return Result<List<SerialNumberDto>>.Success(dtos);
    }
}

public sealed class GetSerialsByWarehouseQueryHandler(ISerialNumberRepository repository)
    : IRequestHandler<GetSerialsByWarehouseQuery, Result<List<SerialNumberDto>>>
{
    public async Task<Result<List<SerialNumberDto>>> Handle(GetSerialsByWarehouseQuery request, CancellationToken ct)
    {
        var serials = await repository.GetByWarehouseAsync(request.CompanyId, request.WarehouseId, ct);
        var dtos = serials.Select(s => new SerialNumberDto(
            s.Id, s.ProductId, s.Product?.Name ?? "", s.Product?.Sku,
            s.BatchId, s.Batch?.Number, s.Serial, s.Status,
            s.WarehouseId, s.Warehouse?.Name ?? "", s.LocationId)).ToList();
        return Result<List<SerialNumberDto>>.Success(dtos);
    }
}
