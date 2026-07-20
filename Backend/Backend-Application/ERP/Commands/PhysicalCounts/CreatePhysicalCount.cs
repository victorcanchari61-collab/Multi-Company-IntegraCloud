using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PhysicalCounts;

public sealed record CreatePhysicalCountCommand(
    Guid CompanyId, Guid UserId, Guid WarehouseId, string? Notes) : IRequest<Result<Guid>>;

public sealed class CreatePhysicalCountCommandHandler(
    IPhysicalCountRepository repository,
    IStockRepository stockRepository)
    : IRequestHandler<CreatePhysicalCountCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreatePhysicalCountCommand request, CancellationToken ct)
    {
        var count = new PhysicalCount(Guid.NewGuid(), request.CompanyId,
            request.WarehouseId, request.Notes?.Trim(), request.UserId);

        // Auto-populate lines from current stock
        var stock = await stockRepository.GetByWarehouseAsync(request.CompanyId, request.WarehouseId, ct);
        foreach (var s in stock.Where(s => s.Quantity > 0))
        {
            count.Lines.Add(new PhysicalCountLine(
                Guid.NewGuid(), count.Id, s.ProductId, s.Quantity, null));
        }

        await repository.AddAsync(count, ct);
        return Result<Guid>.Success(count.Id);
    }
}
