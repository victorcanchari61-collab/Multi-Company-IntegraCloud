using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.CommercialTerms;

public sealed record GetCommercialTermsQuery(Guid CompanyId) : IRequest<Result<List<CommercialTermDto>>>;

public sealed class GetCommercialTermsQueryHandler(ICommercialTermRepository repository)
    : IRequestHandler<GetCommercialTermsQuery, Result<List<CommercialTermDto>>>
{
    public async Task<Result<List<CommercialTermDto>>> Handle(GetCommercialTermsQuery request, CancellationToken ct)
    {
        var list = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = list.Select(c => new CommercialTermDto(
            c.Id, c.Code, c.Name, c.Description, c.PaymentDays, c.IsActive)).ToList();
        return Result<List<CommercialTermDto>>.Success(dtos);
    }
}
