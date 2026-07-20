using Backend.Application.ERP.DTOs.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Quotations;

public sealed record GetQuotationByIdQuery(Guid Id, Guid CompanyId) : IRequest<Result<QuotationDto>>;

public sealed class GetQuotationByIdQueryHandler(IQuotationRepository repository)
    : IRequestHandler<GetQuotationByIdQuery, Result<QuotationDto>>
{
    public async Task<Result<QuotationDto>> Handle(GetQuotationByIdQuery request, CancellationToken ct)
    {
        var q = await repository.GetWithItemsAsync(request.Id, ct);
        if (q == null || q.CompanyId != request.CompanyId)
            return Result<QuotationDto>.Failure(Error.NotFound("quotation.not_found", "Cotización no encontrada."));

        return Result<QuotationDto>.Success(new QuotationDto(
            q.Id, q.CustomerId, q.Customer?.BusinessName ?? "", q.QuotationNumber,
            q.IssueDate, q.ValidUntil, q.Status.ToString(),
            q.SubTotal, q.Tax, q.Total, q.Notes,
            q.Items.Select(i => new QuotationItemDto(
                i.Id, i.ProductId, "", i.Quantity, i.UnitPrice, i.SubTotal)).ToList()));
    }
}
