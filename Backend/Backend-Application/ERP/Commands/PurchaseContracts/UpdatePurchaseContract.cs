using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PurchaseContracts;

public sealed record UpdatePurchaseContractCommand(
    Guid Id, Guid CompanyId, string Title, DateTime StartDate,
    DateTime EndDate, decimal? Value, string? Terms) : IRequest<Result>;

public sealed class UpdatePurchaseContractCommandHandler(IPurchaseContractRepository repository)
    : IRequestHandler<UpdatePurchaseContractCommand, Result>
{
    public async Task<Result> Handle(UpdatePurchaseContractCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("purchase_contract.not_found", "Contrato no encontrado."));

        entity.Update(request.Title, request.StartDate, request.EndDate, request.Value, request.Terms);
        return Result.Success();
    }
}
