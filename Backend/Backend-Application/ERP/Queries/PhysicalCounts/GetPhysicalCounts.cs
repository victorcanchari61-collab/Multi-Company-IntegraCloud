using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.PhysicalCounts;

public sealed record GetPhysicalCountsQuery(Guid CompanyId, Guid? WarehouseId) : IRequest<Result<List<PhysicalCountDto>>>;

public sealed class GetPhysicalCountsQueryHandler(IPhysicalCountRepository repository)
    : IRequestHandler<GetPhysicalCountsQuery, Result<List<PhysicalCountDto>>>
{
    public async Task<Result<List<PhysicalCountDto>>> Handle(GetPhysicalCountsQuery request, CancellationToken ct)
    {
        List<Domain.ERP.Entities.PhysicalCount> counts;
        if (request.WarehouseId.HasValue)
            counts = await repository.GetByWarehouseAsync(request.CompanyId, request.WarehouseId.Value, ct);
        else
        {
            // all by company - need all warehouses
            var all = await repository.GetAllAsync(ct);
            counts = all.Where(c => c.CompanyId == request.CompanyId)
                       .OrderByDescending(c => c.CreatedAt).ToList();
        }

        var dtos = counts.Select(c => new PhysicalCountDto(
            c.Id, c.WarehouseId, c.Warehouse?.Name ?? "", c.Status,
            c.Notes, c.CreatedAt, c.Lines.Count, c.Lines.Count(l => l.Status == "COUNTED"))).ToList();
        return Result<List<PhysicalCountDto>>.Success(dtos);
    }
}

public sealed record GetPhysicalCountByIdQuery(Guid Id, Guid CompanyId) : IRequest<Result<PhysicalCountDetailDto>>;

public sealed class GetPhysicalCountByIdQueryHandler(IPhysicalCountRepository repository)
    : IRequestHandler<GetPhysicalCountByIdQuery, Result<PhysicalCountDetailDto>>
{
    public async Task<Result<PhysicalCountDetailDto>> Handle(GetPhysicalCountByIdQuery request, CancellationToken ct)
    {
        var count = await repository.GetWithLinesAsync(request.Id, ct);
        if (count is null || count.CompanyId != request.CompanyId)
            return Result<PhysicalCountDetailDto>.Failure(Error.NotFound("count.notfound", "Conteo no encontrado."));

        var lines = count.Lines.Select(l => new PhysicalCountLineDto(
            l.Id, l.ProductId, l.Product?.Name ?? "", l.Product?.Sku,
            l.ExpectedQuantity, l.CountedQuantity, l.Difference, l.Notes, l.Status)).ToList();

        var dto = new PhysicalCountDetailDto(
            count.Id, count.WarehouseId, count.Warehouse?.Name ?? "", count.Status,
            count.Notes, count.CreatedAt, count.CompletedAt, count.ApprovedAt, lines);
        return Result<PhysicalCountDetailDto>.Success(dto);
    }
}
