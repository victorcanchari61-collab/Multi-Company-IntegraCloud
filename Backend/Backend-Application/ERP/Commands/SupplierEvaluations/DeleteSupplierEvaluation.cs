using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.SupplierEvaluations;

public sealed record DeleteSupplierEvaluationCommand(Guid Id, Guid CompanyId) : IRequest<Result>;

public sealed class DeleteSupplierEvaluationCommandHandler(ISupplierEvaluationRepository repository)
    : IRequestHandler<DeleteSupplierEvaluationCommand, Result>
{
    public async Task<Result> Handle(DeleteSupplierEvaluationCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("supplier_evaluation.not_found", "Evaluación no encontrada."));

        repository.Delete(entity);
        return Result.Success();
    }
}
