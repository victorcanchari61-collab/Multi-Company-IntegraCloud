using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Entities.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PurchaseContracts;

public sealed record CreatePurchaseContractCommand(
    Guid CompanyId, Guid SupplierId, string ContractNumber, string Title,
    DateTime StartDate, DateTime EndDate, decimal? Value, string? Terms)
    : IRequest<Result<Guid>>;

public sealed class CreatePurchaseContractCommandHandler(IPurchaseContractRepository repository)
    : IRequestHandler<CreatePurchaseContractCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreatePurchaseContractCommand request, CancellationToken ct)
    {
        var contract = new PurchaseContract(Guid.NewGuid(), request.CompanyId, request.SupplierId,
            request.ContractNumber, request.Title, request.StartDate, request.EndDate);

        contract.Update(request.Title, request.StartDate, request.EndDate, request.Value, request.Terms);

        await repository.AddAsync(contract, ct);
        return Result<Guid>.Success(contract.Id);
    }
}
