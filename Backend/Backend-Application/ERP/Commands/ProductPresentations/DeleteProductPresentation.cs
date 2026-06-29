using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.ProductPresentations;

public sealed record DeleteProductPresentationCommand(Guid Id) : IRequest<Result>;

public sealed class DeleteProductPresentationCommandHandler(IProductPresentationRepository repository)
    : IRequestHandler<DeleteProductPresentationCommand, Result>
{
    public async Task<Result> Handle(DeleteProductPresentationCommand request, CancellationToken ct)
    {
        var presentation = await repository.GetByIdAsync(request.Id, ct);
        if (presentation is null)
            return Result.Failure(Error.NotFound("presentation.notfound", "Presentación no encontrada."));

        repository.Delete(presentation);
        return Result.Success();
    }
}
