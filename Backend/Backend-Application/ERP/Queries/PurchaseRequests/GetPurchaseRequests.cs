using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.PurchaseRequests;

public sealed record GetPurchaseRequestsQuery(Guid CompanyId) : IRequest<Result<List<PurchaseRequestDto>>>;

public sealed class GetPurchaseRequestsQueryHandler(IPurchaseRequestRepository repository)
    : IRequestHandler<GetPurchaseRequestsQuery, Result<List<PurchaseRequestDto>>>
{
    public async Task<Result<List<PurchaseRequestDto>>> Handle(GetPurchaseRequestsQuery request, CancellationToken ct)
    {
        var list = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = list.Select(pr => new PurchaseRequestDto(
            pr.Id, pr.RequestNumber, pr.RequesterName, pr.Department,
            pr.RequestDate, pr.ExpectedDate, pr.SupplierId, pr.Supplier?.BusinessName,
            pr.Priority, pr.Status.ToString(), pr.Notes,
            pr.Items.Select(i => new PurchaseRequestItemDto(
                i.Id, i.ProductId, "", i.Quantity, i.Description, i.EstimatedPrice)).ToList())).ToList();
        return Result<List<PurchaseRequestDto>>.Success(dtos);
    }
}
