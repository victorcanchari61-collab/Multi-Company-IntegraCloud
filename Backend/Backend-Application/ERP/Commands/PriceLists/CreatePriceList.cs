using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PriceLists;

public sealed record CreatePriceListCommand(
    Guid CompanyId, string Name, string? Description, string Type)
    : IRequest<Result<Guid>>;

public sealed class CreatePriceListCommandHandler(IPriceListRepository repository)
    : IRequestHandler<CreatePriceListCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreatePriceListCommand request, CancellationToken ct)
    {
        var priceList = new PriceList(
            Guid.NewGuid(), request.CompanyId, request.Name.Trim(), request.Description?.Trim(), request.Type);
        await repository.AddAsync(priceList, ct);
        return Result<Guid>.Success(priceList.Id);
    }
}
