using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.SupplierEvaluations;

public sealed record UpdateSupplierEvaluationCommand(
    Guid Id, Guid CompanyId, int Score, decimal? PriceRating, decimal? QualityRating,
    decimal? DeliveryRating, decimal? ServiceRating, string? Comments) : IRequest<Result>;

public sealed class UpdateSupplierEvaluationCommandHandler(ISupplierEvaluationRepository repository)
    : IRequestHandler<UpdateSupplierEvaluationCommand, Result>
{
    public async Task<Result> Handle(UpdateSupplierEvaluationCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("supplier_evaluation.not_found", "Evaluación no encontrada."));

        entity.Update(request.Score, request.PriceRating, request.QualityRating,
            request.DeliveryRating, request.ServiceRating, request.Comments);
        return Result.Success();
    }
}
