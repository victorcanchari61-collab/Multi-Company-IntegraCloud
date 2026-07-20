using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Currencies;

public sealed record CreateCurrencyCommand(
    Guid CompanyId, string Code, string Name, string? Symbol)
    : IRequest<Result<Guid>>;

public sealed class CreateCurrencyCommandHandler(ICurrencyRepository repository)
    : IRequestHandler<CreateCurrencyCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateCurrencyCommand request, CancellationToken ct)
    {
        var currency = new Currency(
            Guid.NewGuid(), request.CompanyId, request.Code.Trim().ToUpperInvariant(),
            request.Name.Trim(), request.Symbol?.Trim());
        await repository.AddAsync(currency, ct);
        return Result<Guid>.Success(currency.Id);
    }
}
