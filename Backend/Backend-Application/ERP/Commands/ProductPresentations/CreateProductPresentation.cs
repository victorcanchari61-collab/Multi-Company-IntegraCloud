using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.ProductPresentations;

public sealed record CreateProductPresentationCommand(
    Guid CompanyId, Guid ProductId, string Name, Guid? UnitOfMeasureId, decimal Factor, bool IsBase, int SortOrder)
    : IRequest<Result<Guid>>;

public sealed class CreateProductPresentationCommandHandler(IProductPresentationRepository repository)
    : IRequestHandler<CreateProductPresentationCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateProductPresentationCommand request, CancellationToken ct)
    {
        var presentation = new ProductPresentation(
            Guid.NewGuid(), request.CompanyId, request.ProductId,
            request.Name.Trim(), request.UnitOfMeasureId, request.Factor,
            request.IsBase, request.SortOrder);

        await repository.AddAsync(presentation, ct);
        return Result<Guid>.Success(presentation.Id);
    }
}
