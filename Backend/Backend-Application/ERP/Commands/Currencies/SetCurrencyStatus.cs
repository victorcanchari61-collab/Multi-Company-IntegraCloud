using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Currencies;

public sealed record SetCurrencyStatusCommand(Guid Id, bool IsActive) : IRequest<Result>;

public sealed class SetCurrencyStatusCommandHandler(ICurrencyRepository repository)
    : IRequestHandler<SetCurrencyStatusCommand, Result>
{
    public async Task<Result> Handle(SetCurrencyStatusCommand request, CancellationToken ct)
    {
        var currency = await repository.GetByIdAsync(request.Id, ct);
        if (currency is null)
            return Result.Failure(Error.NotFound("currency.notfound", "Moneda no encontrada."));

        if (request.IsActive) currency.Activate();
        else currency.Deactivate();

        repository.Update(currency);
        return Result.Success();
    }
}
