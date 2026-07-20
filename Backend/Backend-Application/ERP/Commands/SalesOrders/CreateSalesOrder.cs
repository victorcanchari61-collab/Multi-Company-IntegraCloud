using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.SalesOrders;

public sealed record CreateSalesOrderCommand(
    Guid CompanyId, Guid CustomerId, DateTime? DeliveryDate, string? Notes,
    List<CreateSalesOrderItemCommand> Items) : IRequest<Result<Guid>>;

public sealed record CreateSalesOrderItemCommand(Guid ProductId, decimal Quantity, decimal UnitPrice);

public sealed class CreateSalesOrderCommandHandler(ISalesOrderRepository repository)
    : IRequestHandler<CreateSalesOrderCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateSalesOrderCommand request, CancellationToken ct)
    {
        var number = await repository.GetNextOrderNumberAsync(request.CompanyId, ct);
        var order = new SalesOrder(Guid.NewGuid(), request.CompanyId, request.CustomerId,
            number, DateTime.UtcNow, request.DeliveryDate);

        foreach (var item in request.Items)
            order.AddItem(item.ProductId, item.Quantity, item.UnitPrice);

        order.Issue();
        await repository.AddAsync(order, ct);
        return Result<Guid>.Success(order.Id);
    }
}
