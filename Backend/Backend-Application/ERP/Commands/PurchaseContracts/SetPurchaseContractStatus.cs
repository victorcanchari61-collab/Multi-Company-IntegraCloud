using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PurchaseContracts;

public sealed record SetPurchaseContractStatusCommand(Guid Id, Guid CompanyId, bool IsActive) : IRequest<Result>;

public sealed class SetPurchaseContractStatusCommandHandler(IPurchaseContractRepository repository)
    : IRequestHandler<SetPurchaseContractStatusCommand, Result>
{
    public async Task<Result> Handle(SetPurchaseContractStatusCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("purchase_contract.not_found", "Contrato no encontrado."));

        if (request.IsActive) entity.Activate(); else entity.Deactivate();
        return Result.Success();
    }
}
