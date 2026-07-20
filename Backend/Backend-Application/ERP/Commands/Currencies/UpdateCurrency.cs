using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Currencies;

public sealed record UpdateCurrencyCommand(
    Guid Id, Guid CompanyId, string Code, string Name, string? Symbol)
    : IRequest<Result>;

public sealed class UpdateCurrencyCommandHandler(ICurrencyRepository repository)
    : IRequestHandler<UpdateCurrencyCommand, Result>
{
    public async Task<Result> Handle(UpdateCurrencyCommand request, CancellationToken ct)
    {
        var currency = await repository.GetByIdAsync(request.Id, ct);
        if (currency is null)
            return Result.Failure(Error.NotFound("currency.notfound", "Moneda no encontrada."));

        currency.Update(request.Code.Trim().ToUpperInvariant(), request.Name.Trim(), request.Symbol?.Trim());
        repository.Update(currency);
        return Result.Success();
    }
}
