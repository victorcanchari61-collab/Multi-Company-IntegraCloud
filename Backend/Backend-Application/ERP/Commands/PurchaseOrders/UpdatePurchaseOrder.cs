using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PurchaseOrders;

public sealed record UpdatePurchaseOrderCommand(
    Guid Id, Guid CompanyId, DateTime? ExpectedDate, string? Notes,
    List<CreatePurchaseOrderItemCommand> Items) : IRequest<Result>;

public sealed class UpdatePurchaseOrderCommandHandler(IPurchaseOrderRepository repository)
    : IRequestHandler<UpdatePurchaseOrderCommand, Result>
{
    public async Task<Result> Handle(UpdatePurchaseOrderCommand request, CancellationToken ct)
    {
        var entity = await repository.GetWithItemsAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("purchase_order.not_found", "Orden de compra no encontrada."));

        var items = request.Items
            .Select(i => (i.ProductId, i.Quantity, i.UnitPrice))
            .ToList();

        entity.Update(request.ExpectedDate, request.Notes, items);
        return Result.Success();
    }
}
