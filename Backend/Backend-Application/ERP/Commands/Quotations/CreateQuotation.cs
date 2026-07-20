using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Quotations;

public sealed record CreateQuotationCommand(
    Guid CompanyId, Guid CustomerId, DateTime? ValidUntil, string? Notes,
    List<CreateQuotationItemCommand> Items) : IRequest<Result<Guid>>;

public sealed record CreateQuotationItemCommand(Guid ProductId, decimal Quantity, decimal UnitPrice);

public sealed class CreateQuotationCommandHandler(IQuotationRepository repository)
    : IRequestHandler<CreateQuotationCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateQuotationCommand request, CancellationToken ct)
    {
        var number = await repository.GetNextQuotationNumberAsync(request.CompanyId, ct);
        var quotation = new Quotation(Guid.NewGuid(), request.CompanyId, request.CustomerId,
            number, DateTime.UtcNow, request.ValidUntil);

        foreach (var item in request.Items)
            quotation.AddItem(item.ProductId, item.Quantity, item.UnitPrice);

        quotation.Issue();
        await repository.AddAsync(quotation, ct);
        return Result<Guid>.Success(quotation.Id);
    }
}
