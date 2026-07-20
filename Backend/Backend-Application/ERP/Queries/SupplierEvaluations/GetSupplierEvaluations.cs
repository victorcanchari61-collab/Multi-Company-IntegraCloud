using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.SupplierEvaluations;

public sealed record GetSupplierEvaluationsQuery(Guid CompanyId, Guid? SupplierId = null)
    : IRequest<Result<List<SupplierEvaluationDto>>>;

public sealed class GetSupplierEvaluationsQueryHandler(
    ISupplierEvaluationRepository repository)
    : IRequestHandler<GetSupplierEvaluationsQuery, Result<List<SupplierEvaluationDto>>>
{
    public async Task<Result<List<SupplierEvaluationDto>>> Handle(GetSupplierEvaluationsQuery request, CancellationToken ct)
    {
        var list = request.SupplierId.HasValue
            ? await repository.GetBySupplierAsync(request.SupplierId.Value, ct)
            : await repository.GetByCompanyAsync(request.CompanyId, ct);

        var dtos = list.Select(e => new SupplierEvaluationDto(
            e.Id, e.SupplierId, e.Supplier?.BusinessName ?? "",
            e.EvaluationDate, e.Score, e.EvaluatedBy,
            e.PriceRating, e.QualityRating, e.DeliveryRating,
            e.ServiceRating, e.Comments, e.OrderId)).ToList();
        return Result<List<SupplierEvaluationDto>>.Success(dtos);
    }
}
