using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.ProductLots;

public sealed record GetProductLotsQuery(Guid ProductId) : IRequest<Result<List<ProductLotDto>>>;

public sealed class GetProductLotsQueryHandler(IProductLotRepository repository)
    : IRequestHandler<GetProductLotsQuery, Result<List<ProductLotDto>>>
{
    public async Task<Result<List<ProductLotDto>>> Handle(GetProductLotsQuery request, CancellationToken ct)
    {
        var lots = await repository.GetByProductAsync(request.ProductId, ct);
        var dtos = lots.Select(l => new ProductLotDto(
            l.Id, l.ProductId, l.Number, l.ExpiryDate, l.InitialStock, l.CreatedAt
        )).ToList();
        return Result<List<ProductLotDto>>.Success(dtos);
    }
}
