using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PurchaseOrders;

public sealed record UpdatePurchaseOrderStatusCommand(
    Guid Id, Guid CompanyId, string Status) : IRequest<Result>;

public sealed class UpdatePurchaseOrderStatusCommandHandler(IPurchaseOrderRepository repository)
    : IRequestHandler<UpdatePurchaseOrderStatusCommand, Result>
{
    public async Task<Result> Handle(UpdatePurchaseOrderStatusCommand request, CancellationToken ct)
    {
        var po = await repository.GetByIdAsync(request.Id, ct);
        if (po == null || po.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("purchase_order.not_found", "Orden de compra no encontrada."));

        switch (request.Status.ToLowerInvariant())
        {
            case "issued": po.Issue(); break;
            case "received":
                var allItems = po.Items.Select(i => (i.ProductId, i.Quantity)).ToList();
                po.Receive(allItems);
                break;
            case "closed": po.Close(); break;
            case "cancelled": po.Cancel(); break;
            default: return Result.Failure(Error.Validation("invalid_status", "Estado inválido."));
        }

        return Result.Success();
    }
}
