using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Quotations;

public sealed record UpdateQuotationStatusCommand(
    Guid Id, Guid CompanyId, string Status) : IRequest<Result>;

public sealed class UpdateQuotationStatusCommandHandler(IQuotationRepository repository)
    : IRequestHandler<UpdateQuotationStatusCommand, Result>
{
    public async Task<Result> Handle(UpdateQuotationStatusCommand request, CancellationToken ct)
    {
        var q = await repository.GetByIdAsync(request.Id, ct);
        if (q == null || q.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("quotation.not_found", "Cotización no encontrada."));

        switch (request.Status.ToLowerInvariant())
        {
            case "issued": q.Issue(); break;
            case "accepted": q.Accept(); break;
            case "rejected": q.Reject(); break;
            case "cancelled": q.Cancel(); break;
            default: return Result.Failure(Error.Validation("invalid_status", "Estado inválido."));
        }

        return Result.Success();
    }
}
