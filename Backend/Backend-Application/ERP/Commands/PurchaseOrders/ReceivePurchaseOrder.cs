using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PurchaseOrders;

public sealed record ReceivePurchaseOrderCommand(
    Guid Id, Guid CompanyId, List<ReceiveItemCommand> Items) : IRequest<Result>;

public sealed record ReceiveItemCommand(Guid ProductId, decimal Quantity);

public sealed class ReceivePurchaseOrderCommandHandler(
    IPurchaseOrderRepository repository) : IRequestHandler<ReceivePurchaseOrderCommand, Result>
{
    public async Task<Result> Handle(ReceivePurchaseOrderCommand request, CancellationToken ct)
    {
        var po = await repository.GetWithItemsAsync(request.Id, ct);
        if (po == null || po.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("purchase_order.not_found", "Orden de compra no encontrada."));

        var items = request.Items
            .Select(i => (i.ProductId, i.Quantity))
            .ToList();

        po.Receive(items);
        return Result.Success();
    }
}
