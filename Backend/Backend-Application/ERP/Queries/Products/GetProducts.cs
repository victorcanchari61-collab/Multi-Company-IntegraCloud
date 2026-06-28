using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Products;

public sealed record GetProductsQuery(Guid CompanyId) : IRequest<Result<List<ProductDto>>>;

public sealed class GetProductsQueryHandler(IProductRepository repository)
    : IRequestHandler<GetProductsQuery, Result<List<ProductDto>>>
{
    public async Task<Result<List<ProductDto>>> Handle(GetProductsQuery request, CancellationToken ct)
    {
        var products = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = products.Select(p => new ProductDto(
            p.Id, p.Name, p.Description, p.Sku, p.Barcode,
            p.CategoryId, p.Category?.Name,
            p.SubcategoryId, p.Subcategory?.Name,
            p.BrandId, p.Brand?.Name,
            p.SubbrandId, p.Subbrand?.Name,
            p.UnitOfMeasureId, p.UnitOfMeasure?.Name,
            p.SalePrice, p.CostPrice, p.IsActive
        )).ToList();
        return Result<List<ProductDto>>.Success(dtos);
    }
}
