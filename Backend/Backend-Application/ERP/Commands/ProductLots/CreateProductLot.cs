using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.ProductLots;

public sealed record CreateProductLotCommand(
    Guid CompanyId, Guid ProductId, string Number, DateOnly? ExpiryDate, decimal InitialStock)
    : IRequest<Result<Guid>>;

public sealed class CreateProductLotCommandHandler(IProductLotRepository repository)
    : IRequestHandler<CreateProductLotCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateProductLotCommand request, CancellationToken ct)
    {
        var lot = new ProductLot(
            Guid.NewGuid(), request.CompanyId, request.ProductId,
            request.Number.Trim(), request.ExpiryDate, request.InitialStock);

        await repository.AddAsync(lot, ct);
        return Result<Guid>.Success(lot.Id);
    }
}
