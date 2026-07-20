using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Entities.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PurchaseRequests;

public sealed record CreatePurchaseRequestCommand(
    Guid CompanyId, string RequesterName, string? Department,
    DateTime? ExpectedDate, string? Notes, Guid? SupplierId, string? Priority,
    List<CreatePurchaseRequestItemCommand> Items) : IRequest<Result<Guid>>;

public sealed record CreatePurchaseRequestItemCommand(
    Guid ProductId, decimal Quantity, string? Description, decimal? EstimatedPrice);

public sealed class CreatePurchaseRequestCommandHandler(IPurchaseRequestRepository repository)
    : IRequestHandler<CreatePurchaseRequestCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreatePurchaseRequestCommand request, CancellationToken ct)
    {
        var requestNumber = await repository.GetNextRequestNumberAsync(request.CompanyId, ct);
        var pr = new PurchaseRequest(Guid.NewGuid(), request.CompanyId, requestNumber,
            request.RequesterName, DateTime.UtcNow, request.SupplierId, request.Priority);

        foreach (var item in request.Items)
            pr.AddItem(item.ProductId, item.Quantity, item.Description, item.EstimatedPrice);

        await repository.AddAsync(pr, ct);
        return Result<Guid>.Success(pr.Id);
    }
}
