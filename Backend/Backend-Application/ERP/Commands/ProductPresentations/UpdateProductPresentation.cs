using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.ProductPresentations;

public sealed record UpdateProductPresentationCommand(
    Guid Id, Guid CompanyId, Guid ProductId, string Name, Guid? UnitOfMeasureId, decimal Factor, bool IsBase, int SortOrder,
    Guid? ComplementaryProductId = null, int ComplementaryQuantity = 0, decimal MarkupPercentage = 0)
    : IRequest<Result>;

public sealed class UpdateProductPresentationCommandHandler(IProductPresentationRepository repository)
    : IRequestHandler<UpdateProductPresentationCommand, Result>
{
    public async Task<Result> Handle(UpdateProductPresentationCommand request, CancellationToken ct)
    {
        var presentation = await repository.GetByIdAsync(request.Id, ct);
        if (presentation is null)
            return Result.Failure(Error.NotFound("presentation.notfound", "Presentación no encontrada."));

        presentation.Update(request.Name.Trim(), request.UnitOfMeasureId, request.Factor, request.IsBase, request.SortOrder,
            request.ComplementaryProductId, request.ComplementaryQuantity, request.MarkupPercentage);
        repository.Update(presentation);
        return Result.Success();
    }
}
