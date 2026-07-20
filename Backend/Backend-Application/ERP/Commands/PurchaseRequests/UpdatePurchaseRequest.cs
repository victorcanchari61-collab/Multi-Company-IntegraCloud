using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PurchaseRequests;

public sealed record UpdatePurchaseRequestCommand(
    Guid Id, Guid CompanyId, string RequesterName, string? Department,
    DateTime? ExpectedDate, string? Notes, Guid? SupplierId, string? Priority,
    List<CreatePurchaseRequestItemCommand> Items) : IRequest<Result>;

public sealed class UpdatePurchaseRequestCommandHandler(IPurchaseRequestRepository repository)
    : IRequestHandler<UpdatePurchaseRequestCommand, Result>
{
    public async Task<Result> Handle(UpdatePurchaseRequestCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("purchase_request.not_found", "Solicitud de compra no encontrada."));

        var items = request.Items
            .Select(i => (i.ProductId, i.Quantity, i.Description, i.EstimatedPrice))
            .ToList();

        entity.Update(request.RequesterName, request.Department, request.ExpectedDate, request.Notes, request.SupplierId, request.Priority, items);
        return Result.Success();
    }
}
