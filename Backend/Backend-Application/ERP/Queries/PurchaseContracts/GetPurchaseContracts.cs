using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.PurchaseContracts;

public sealed record GetPurchaseContractsQuery(Guid CompanyId, Guid? SupplierId = null)
    : IRequest<Result<List<PurchaseContractDto>>>;

public sealed class GetPurchaseContractsQueryHandler(
    IPurchaseContractRepository repository)
    : IRequestHandler<GetPurchaseContractsQuery, Result<List<PurchaseContractDto>>>
{
    public async Task<Result<List<PurchaseContractDto>>> Handle(GetPurchaseContractsQuery request, CancellationToken ct)
    {
        var list = request.SupplierId.HasValue
            ? await repository.GetBySupplierAsync(request.SupplierId.Value, ct)
            : await repository.GetByCompanyAsync(request.CompanyId, ct);

        var dtos = list.Select(c => new PurchaseContractDto(
            c.Id, c.SupplierId, c.Supplier?.BusinessName ?? "",
            c.ContractNumber, c.Title, c.StartDate, c.EndDate,
            c.Value, c.Terms, c.IsActive)).ToList();
        return Result<List<PurchaseContractDto>>.Success(dtos);
    }
}
