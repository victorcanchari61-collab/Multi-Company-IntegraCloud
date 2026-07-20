using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Quotations;

public sealed record GetQuotationsQuery(Guid CompanyId) : IRequest<Result<List<QuotationDto>>>;

public sealed class GetQuotationsQueryHandler(IQuotationRepository repository)
    : IRequestHandler<GetQuotationsQuery, Result<List<QuotationDto>>>
{
    public async Task<Result<List<QuotationDto>>> Handle(GetQuotationsQuery request, CancellationToken ct)
    {
        var list = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = list.Select(q => new QuotationDto(
            q.Id, q.CustomerId, q.Customer?.BusinessName ?? "", q.QuotationNumber,
            q.IssueDate, q.ValidUntil, q.Status.ToString(),
            q.SubTotal, q.Tax, q.Total, q.Notes,
            q.Items.Select(i => new QuotationItemDto(
                i.Id, i.ProductId, "", i.Quantity, i.UnitPrice, i.SubTotal)).ToList())).ToList();
        return Result<List<QuotationDto>>.Success(dtos);
    }
}
