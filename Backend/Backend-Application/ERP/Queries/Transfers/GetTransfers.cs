using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Transfers;

public sealed record GetTransfersQuery(Guid CompanyId) : IRequest<Result<List<TransferDto>>>;

public sealed class GetTransfersQueryHandler(ITransferRepository repository)
    : IRequestHandler<GetTransfersQuery, Result<List<TransferDto>>>
{
    public async Task<Result<List<TransferDto>>> Handle(GetTransfersQuery request, CancellationToken ct)
    {
        var transfers = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = new List<TransferDto>();
        foreach (var t in transfers)
        {
            var full = await repository.GetWithItemsAsync(t.Id, ct);
            dtos.Add(new TransferDto(
                t.Id, t.FromWarehouse?.Name ?? "", t.ToWarehouse?.Name ?? "",
                t.Status, t.Notes, t.CreatedAt, t.CompletedAt,
                full?.Items.Select(i => new TransferItemDto(
                    i.Id, i.ProductId, i.Product?.Name, i.Quantity, i.UnitCost)).ToList() ?? []));
        }
        return Result<List<TransferDto>>.Success(dtos);
    }
}

public sealed record GetTransferByIdQuery(Guid Id) : IRequest<Result<TransferDto>>;

public sealed class GetTransferByIdQueryHandler(ITransferRepository repository)
    : IRequestHandler<GetTransferByIdQuery, Result<TransferDto>>
{
    public async Task<Result<TransferDto>> Handle(GetTransferByIdQuery request, CancellationToken ct)
    {
        var t = await repository.GetWithItemsAsync(request.Id, ct);
        if (t is null)
            return Result<TransferDto>.Failure(Error.NotFound("transfer.notfound", "Transferencia no encontrada."));

        var dto = new TransferDto(
            t.Id, t.FromWarehouse?.Name ?? "", t.ToWarehouse?.Name ?? "",
            t.Status, t.Notes, t.CreatedAt, t.CompletedAt,
            t.Items.Select(i => new TransferItemDto(
                i.Id, i.ProductId, i.Product?.Name, i.Quantity, i.UnitCost)).ToList());
        return Result<TransferDto>.Success(dto);
    }
}
