using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.SalesOrders;

public sealed record UpdateSalesOrderStatusCommand(
    Guid Id, Guid CompanyId, string Status) : IRequest<Result>;

public sealed class UpdateSalesOrderStatusCommandHandler(ISalesOrderRepository repository)
    : IRequestHandler<UpdateSalesOrderStatusCommand, Result>
{
    public async Task<Result> Handle(UpdateSalesOrderStatusCommand request, CancellationToken ct)
    {
        var so = await repository.GetByIdAsync(request.Id, ct);
        if (so == null || so.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("sales_order.not_found", "Orden de venta no encontrada."));

        switch (request.Status.ToLowerInvariant())
        {
            case "issued": so.Issue(); break;
            case "confirmed": so.Confirm(); break;
            case "shipped": so.Ship(); break;
            case "delivered": so.Deliver(); break;
            case "cancelled": so.Cancel(); break;
            default: return Result.Failure(Error.Validation("invalid_status", "Estado inválido."));
        }

        return Result.Success();
    }
}
