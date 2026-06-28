using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Products;

public sealed record CreateProductCommand(
    Guid CompanyId, string Name, string? Description, string? Sku, string? Barcode,
    Guid? CategoryId, Guid? SubcategoryId, Guid? BrandId, Guid? SubbrandId,
    Guid? UnitOfMeasureId, decimal? SalePrice, decimal? CostPrice)
    : IRequest<Result<Guid>>;

public sealed class CreateProductCommandHandler(IProductRepository repository)
    : IRequestHandler<CreateProductCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(request.Sku))
        {
            var sku = request.Sku.Trim();
            if (await repository.ExistsBySkuAsync(request.CompanyId, sku, null, ct))
                return Result<Guid>.Failure(Error.Conflict("product.sku.exists", "Ya existe un producto con ese SKU."));
        }

        var product = new Product(
            Guid.NewGuid(), request.CompanyId, request.Name.Trim(), request.Description?.Trim(),
            request.Sku?.Trim(), request.Barcode?.Trim(),
            request.CategoryId, request.SubcategoryId,
            request.BrandId, request.SubbrandId,
            request.UnitOfMeasureId, request.SalePrice, request.CostPrice);

        await repository.AddAsync(product, ct);
        return Result<Guid>.Success(product.Id);
    }
}
