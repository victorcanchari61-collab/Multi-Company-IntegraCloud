using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Products;

/// <summary>
/// Devuelve la imagen y ficha técnica (data-URL) de un producto. Endpoint aparte
/// para NO cargar los base64 en el listado (GetProducts).
/// </summary>
public sealed record GetProductMediaQuery(Guid Id, Guid CompanyId) : IRequest<Result<ProductMediaDto>>;

public sealed class GetProductMediaQueryHandler(IProductRepository repository)
    : IRequestHandler<GetProductMediaQuery, Result<ProductMediaDto>>
{
    public async Task<Result<ProductMediaDto>> Handle(GetProductMediaQuery request, CancellationToken ct)
    {
        var product = await repository.GetByIdAsync(request.Id, ct);
        if (product is null || product.CompanyId != request.CompanyId)
            return Result<ProductMediaDto>.Failure(Error.NotFound("product.notfound", "Producto no encontrado."));

        return Result<ProductMediaDto>.Success(
            new ProductMediaDto(product.Id, product.ImageUrl, product.TechnicalSheetUrl));
    }
}
