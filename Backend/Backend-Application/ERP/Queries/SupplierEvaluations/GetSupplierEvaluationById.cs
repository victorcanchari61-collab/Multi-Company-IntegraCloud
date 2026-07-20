using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.SupplierEvaluations;

public sealed record GetSupplierEvaluationByIdQuery(Guid Id, Guid CompanyId) : IRequest<Result<SupplierEvaluationDto>>;

public sealed class GetSupplierEvaluationByIdQueryHandler(ISupplierEvaluationRepository repository)
    : IRequestHandler<GetSupplierEvaluationByIdQuery, Result<SupplierEvaluationDto>>
{
    public async Task<Result<SupplierEvaluationDto>> Handle(GetSupplierEvaluationByIdQuery request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result<SupplierEvaluationDto>.Failure(Error.NotFound("supplier_evaluation.not_found", "Evaluación no encontrada."));

        return Result<SupplierEvaluationDto>.Success(new SupplierEvaluationDto(
            entity.Id, entity.SupplierId, entity.Supplier?.BusinessName ?? "",
            entity.EvaluationDate, entity.Score, entity.EvaluatedBy,
            entity.PriceRating, entity.QualityRating, entity.DeliveryRating,
            entity.ServiceRating, entity.Comments, entity.OrderId));
    }
}
