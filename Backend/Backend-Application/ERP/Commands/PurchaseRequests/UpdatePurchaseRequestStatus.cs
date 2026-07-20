using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PurchaseRequests;

public sealed record UpdatePurchaseRequestStatusCommand(
    Guid Id, Guid CompanyId, string Status) : IRequest<Result>;

public sealed class UpdatePurchaseRequestStatusCommandHandler(IPurchaseRequestRepository repository)
    : IRequestHandler<UpdatePurchaseRequestStatusCommand, Result>
{
    public async Task<Result> Handle(UpdatePurchaseRequestStatusCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("purchase_request.not_found", "Solicitud de compra no encontrada."));

        switch (request.Status.ToLowerInvariant())
        {
            case "approved": entity.Approve(); break;
            case "rejected": entity.Reject(); break;
            case "ordered": entity.MarkOrdered(); break;
            default: return Result.Failure(Error.Validation("invalid_status", "Estado inválido."));
        }

        return Result.Success();
    }
}
