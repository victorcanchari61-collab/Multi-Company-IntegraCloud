using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.PurchaseRequests;

public sealed record GetPurchaseRequestByIdQuery(Guid Id, Guid CompanyId) : IRequest<Result<PurchaseRequestDto>>;

public sealed class GetPurchaseRequestByIdQueryHandler(IPurchaseRequestRepository repository)
    : IRequestHandler<GetPurchaseRequestByIdQuery, Result<PurchaseRequestDto>>
{
    public async Task<Result<PurchaseRequestDto>> Handle(GetPurchaseRequestByIdQuery request, CancellationToken ct)
    {
        var entity = await repository.GetWithSupplierAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result<PurchaseRequestDto>.Failure(Error.NotFound("purchase_request.not_found", "Solicitud de compra no encontrada."));

        return Result<PurchaseRequestDto>.Success(new PurchaseRequestDto(
            entity.Id, entity.RequestNumber, entity.RequesterName, entity.Department,
            entity.RequestDate, entity.ExpectedDate, entity.SupplierId, entity.Supplier?.BusinessName,
            entity.Priority, entity.Status.ToString(), entity.Notes,
            entity.Items.Select(i => new PurchaseRequestItemDto(
                i.Id, i.ProductId, "", i.Quantity, i.Description, i.EstimatedPrice)).ToList()));
    }
}
