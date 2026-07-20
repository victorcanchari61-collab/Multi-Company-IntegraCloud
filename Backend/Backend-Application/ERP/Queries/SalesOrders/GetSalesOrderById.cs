using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.SalesOrders;

public sealed record GetSalesOrderByIdQuery(Guid Id, Guid CompanyId) : IRequest<Result<SalesOrderDto>>;

public sealed class GetSalesOrderByIdQueryHandler(ISalesOrderRepository repository)
    : IRequestHandler<GetSalesOrderByIdQuery, Result<SalesOrderDto>>
{
    public async Task<Result<SalesOrderDto>> Handle(GetSalesOrderByIdQuery request, CancellationToken ct)
    {
        var so = await repository.GetWithItemsAsync(request.Id, ct);
        if (so == null || so.CompanyId != request.CompanyId)
            return Result<SalesOrderDto>.Failure(Error.NotFound("sales_order.not_found", "Orden de venta no encontrada."));

        return Result<SalesOrderDto>.Success(new SalesOrderDto(
            so.Id, so.CustomerId, so.Customer?.BusinessName ?? "", so.OrderNumber,
            so.IssueDate, so.DeliveryDate, so.Status.ToString(),
            so.SubTotal, so.Tax, so.Total, so.Notes,
            so.Items.Select(i => new SalesOrderItemDto(
                i.Id, i.ProductId, "", i.Quantity, i.UnitPrice, i.SubTotal)).ToList()));
    }
}
