using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Products;

public sealed record UpdateProductCommand(
    Guid Id, Guid CompanyId, string Name, string? Description, string? TicketDescription, string? Sku, string? Barcode,
    Guid? CategoryId, Guid? SubcategoryId, Guid? BrandId, Guid? SubbrandId,
    Guid? UnitOfMeasureId, decimal? SalePrice, decimal? CostPrice,
    decimal? StockMin, decimal? StockMax,
    string? LoteNumber, DateOnly? LoteExpiry,
    decimal? LoteStock, decimal? LoteStockFraction,
    string? TechnicalAction)
    : IRequest<Result>;

public sealed class UpdateProductCommandHandler(IProductRepository repository)
    : IRequestHandler<UpdateProductCommand, Result>
{
    public async Task<Result> Handle(UpdateProductCommand request, CancellationToken ct)
    {
        var product = await repository.GetByIdAsync(request.Id, ct);
        if (product is null)
            return Result.Failure(Error.NotFound("product.notfound", "Producto no encontrado."));

        if (!string.IsNullOrWhiteSpace(request.Sku))
        {
            var sku = request.Sku.Trim();
            if (await repository.ExistsBySkuAsync(request.CompanyId, sku, request.Id, ct))
                return Result.Failure(Error.Conflict("product.sku.exists", "Ya existe un producto con ese SKU."));
        }

        product.Update(
            request.Name.Trim(), request.Description?.Trim(), request.TicketDescription?.Trim(),
            request.Sku?.Trim(), request.Barcode?.Trim(),
            request.CategoryId, request.SubcategoryId,
            request.BrandId, request.SubbrandId,
            request.UnitOfMeasureId, request.SalePrice, request.CostPrice,
            request.StockMin, request.StockMax,
            request.LoteNumber?.Trim(), request.LoteExpiry,
            request.LoteStock, request.LoteStockFraction,
            request.TechnicalAction?.Trim());

        repository.Update(product);
        return Result.Success();
    }
}
