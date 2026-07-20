using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.PurchaseOrders;

public sealed record GetPurchaseOrdersQuery(Guid CompanyId) : IRequest<Result<List<PurchaseOrderDto>>>;

public sealed class GetPurchaseOrdersQueryHandler(IPurchaseOrderRepository repository)
    : IRequestHandler<GetPurchaseOrdersQuery, Result<List<PurchaseOrderDto>>>
{
    public async Task<Result<List<PurchaseOrderDto>>> Handle(GetPurchaseOrdersQuery request, CancellationToken ct)
    {
        var list = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = list.Select(po => new PurchaseOrderDto(
            po.Id, po.SupplierId, po.Supplier?.BusinessName ?? "", po.OrderNumber,
            po.IssueDate, po.ExpectedDate, po.Status.ToString(),
            po.SubTotal, po.Tax, po.Total, po.Notes,
            po.Items.Select(i => new PurchaseOrderItemDto(
                i.Id, i.ProductId, "", i.Quantity, i.UnitPrice, i.SubTotal, i.QuantityReceived)).ToList())).ToList();
        return Result<List<PurchaseOrderDto>>.Success(dtos);
    }
}
