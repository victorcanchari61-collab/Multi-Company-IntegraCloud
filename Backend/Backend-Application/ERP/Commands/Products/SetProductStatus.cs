using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Products;

public sealed record SetProductStatusCommand(Guid Id, Guid CompanyId, bool IsActive) : IRequest<Result>;

public sealed class SetProductStatusCommandHandler(IProductRepository repository)
    : IRequestHandler<SetProductStatusCommand, Result>
{
    public async Task<Result> Handle(SetProductStatusCommand request, CancellationToken ct)
    {
        var product = await repository.GetByIdAsync(request.Id, ct);
        if (product is null || product.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("product.notfound", "Producto no encontrado."));

        if (request.IsActive) product.Activate();
        else product.Deactivate();

        repository.Update(product);
        return Result.Success();
    }
}
