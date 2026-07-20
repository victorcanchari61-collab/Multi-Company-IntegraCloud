using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.SalesOrders;

public sealed record GetSalesOrdersQuery(Guid CompanyId) : IRequest<Result<List<SalesOrderDto>>>;

public sealed class GetSalesOrdersQueryHandler(ISalesOrderRepository repository)
    : IRequestHandler<GetSalesOrdersQuery, Result<List<SalesOrderDto>>>
{
    public async Task<Result<List<SalesOrderDto>>> Handle(GetSalesOrdersQuery request, CancellationToken ct)
    {
        var list = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = list.Select(so => new SalesOrderDto(
            so.Id, so.CustomerId, so.Customer?.BusinessName ?? "", so.OrderNumber,
            so.IssueDate, so.DeliveryDate, so.Status.ToString(),
            so.SubTotal, so.Tax, so.Total, so.Notes,
            so.Items.Select(i => new SalesOrderItemDto(
                i.Id, i.ProductId, "", i.Quantity, i.UnitPrice, i.SubTotal)).ToList())).ToList();
        return Result<List<SalesOrderDto>>.Success(dtos);
    }
}
