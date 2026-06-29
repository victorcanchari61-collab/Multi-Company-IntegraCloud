using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Currencies;

public sealed record GetCurrenciesQuery(Guid CompanyId) : IRequest<Result<List<CurrencyDto>>>;

public sealed class GetCurrenciesQueryHandler(ICurrencyRepository repository)
    : IRequestHandler<GetCurrenciesQuery, Result<List<CurrencyDto>>>
{
    public async Task<Result<List<CurrencyDto>>> Handle(GetCurrenciesQuery request, CancellationToken ct)
    {
        var currencies = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = currencies.Select(c => new CurrencyDto(c.Id, c.Code, c.Name, c.Symbol, c.IsActive)).ToList();
        return Result<List<CurrencyDto>>.Success(dtos);
    }
}
