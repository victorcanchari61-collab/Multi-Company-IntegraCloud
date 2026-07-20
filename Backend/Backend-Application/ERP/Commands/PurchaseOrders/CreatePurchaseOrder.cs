using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Entities.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PurchaseOrders;

public sealed record CreatePurchaseOrderCommand(
    Guid CompanyId, Guid SupplierId, DateTime? ExpectedDate, string? Notes,
    List<CreatePurchaseOrderItemCommand> Items) : IRequest<Result<Guid>>;

public sealed record CreatePurchaseOrderItemCommand(Guid ProductId, decimal Quantity, decimal UnitPrice);

public sealed class CreatePurchaseOrderCommandHandler(IPurchaseOrderRepository repository)
    : IRequestHandler<CreatePurchaseOrderCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreatePurchaseOrderCommand request, CancellationToken ct)
    {
        var orderNumber = await repository.GetNextOrderNumberAsync(request.CompanyId, ct);
        var po = new PurchaseOrder(Guid.NewGuid(), request.CompanyId, request.SupplierId,
            orderNumber, DateTime.UtcNow, request.ExpectedDate);

        foreach (var item in request.Items)
            po.AddItem(item.ProductId, item.Quantity, item.UnitPrice);

        po.Issue();
        await repository.AddAsync(po, ct);
        return Result<Guid>.Success(po.Id);
    }
}
