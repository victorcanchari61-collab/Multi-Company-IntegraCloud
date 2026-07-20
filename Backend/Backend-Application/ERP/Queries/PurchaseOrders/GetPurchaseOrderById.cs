using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.PurchaseOrders;

public sealed record GetPurchaseOrderByIdQuery(Guid Id, Guid CompanyId) : IRequest<Result<PurchaseOrderDto>>;

public sealed class GetPurchaseOrderByIdQueryHandler(IPurchaseOrderRepository repository)
    : IRequestHandler<GetPurchaseOrderByIdQuery, Result<PurchaseOrderDto>>
{
    public async Task<Result<PurchaseOrderDto>> Handle(GetPurchaseOrderByIdQuery request, CancellationToken ct)
    {
        var po = await repository.GetWithItemsAsync(request.Id, ct);
        if (po == null || po.CompanyId != request.CompanyId)
            return Result<PurchaseOrderDto>.Failure(Error.NotFound("purchase_order.not_found", "Orden de compra no encontrada."));

        return Result<PurchaseOrderDto>.Success(new PurchaseOrderDto(
            po.Id, po.SupplierId, po.Supplier?.BusinessName ?? "", po.OrderNumber,
            po.IssueDate, po.ExpectedDate, po.Status.ToString(),
            po.SubTotal, po.Tax, po.Total, po.Notes,
            po.Items.Select(i => new PurchaseOrderItemDto(
                i.Id, i.ProductId, "", i.Quantity, i.UnitPrice, i.SubTotal, i.QuantityReceived)).ToList()));
    }
}
