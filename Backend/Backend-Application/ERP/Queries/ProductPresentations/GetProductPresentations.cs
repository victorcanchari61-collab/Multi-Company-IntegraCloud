using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.ProductPresentations;

public sealed record GetProductPresentationsQuery(Guid ProductId) : IRequest<Result<List<ProductPresentationDto>>>;

public sealed class GetProductPresentationsQueryHandler(IProductPresentationRepository repository)
    : IRequestHandler<GetProductPresentationsQuery, Result<List<ProductPresentationDto>>>
{
    public async Task<Result<List<ProductPresentationDto>>> Handle(GetProductPresentationsQuery request, CancellationToken ct)
    {
        var presentations = await repository.GetByProductAsync(request.ProductId, ct);
        var dtos = presentations.Select(p => new ProductPresentationDto(
            p.Id, p.ProductId, p.Name,
            p.UnitOfMeasureId, p.UnitOfMeasure?.Name,
            p.Factor, p.IsBase, p.SortOrder, p.IsActive,
            p.ComplementaryProductId, p.ComplementaryProduct != null ? p.ComplementaryProduct.Name : null,
            p.ComplementaryQuantity, p.MarkupPercentage
        )).ToList();
        return Result<List<ProductPresentationDto>>.Success(dtos);
    }
}
