using Backend.Application.ERP.DTOs.Compras;
using Backend.Domain.ERP.Entities.Compras;
using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.SupplierEvaluations;

public sealed record CreateSupplierEvaluationCommand(
    Guid CompanyId, Guid SupplierId, DateTime EvaluationDate, int Score,
    string EvaluatedBy, decimal? PriceRating, decimal? QualityRating,
    decimal? DeliveryRating, decimal? ServiceRating, string? Comments,
    Guid? OrderId = null)
    : IRequest<Result<Guid>>;

public sealed class CreateSupplierEvaluationCommandHandler(ISupplierEvaluationRepository repository)
    : IRequestHandler<CreateSupplierEvaluationCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateSupplierEvaluationCommand request, CancellationToken ct)
    {
        var evaluation = new SupplierEvaluation(Guid.NewGuid(), request.CompanyId, request.SupplierId,
            request.EvaluationDate, request.Score, request.EvaluatedBy, request.OrderId);

        evaluation.Update(request.Score, request.PriceRating, request.QualityRating,
            request.DeliveryRating, request.ServiceRating, request.Comments);

        await repository.AddAsync(evaluation, ct);
        return Result<Guid>.Success(evaluation.Id);
    }
}
