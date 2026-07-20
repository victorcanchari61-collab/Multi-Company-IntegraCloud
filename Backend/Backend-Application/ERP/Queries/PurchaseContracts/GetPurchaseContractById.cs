using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.PurchaseContracts;

public sealed record GetPurchaseContractByIdQuery(Guid Id, Guid CompanyId) : IRequest<Result<PurchaseContractDto>>;

public sealed class GetPurchaseContractByIdQueryHandler(IPurchaseContractRepository repository)
    : IRequestHandler<GetPurchaseContractByIdQuery, Result<PurchaseContractDto>>
{
    public async Task<Result<PurchaseContractDto>> Handle(GetPurchaseContractByIdQuery request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result<PurchaseContractDto>.Failure(Error.NotFound("purchase_contract.not_found", "Contrato no encontrado."));

        return Result<PurchaseContractDto>.Success(new PurchaseContractDto(
            entity.Id, entity.SupplierId, entity.Supplier?.BusinessName ?? "",
            entity.ContractNumber, entity.Title, entity.StartDate, entity.EndDate,
            entity.Value, entity.Terms, entity.IsActive));
    }
}
