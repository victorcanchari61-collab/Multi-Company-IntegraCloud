using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.CommercialTerms;

public sealed record SetCommercialTermStatusCommand(Guid Id, Guid CompanyId, bool IsActive) : IRequest<Result>;

public sealed class SetCommercialTermStatusCommandHandler(ICommercialTermRepository repository)
    : IRequestHandler<SetCommercialTermStatusCommand, Result>
{
    public async Task<Result> Handle(SetCommercialTermStatusCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("commercial_term.not_found", "Condición comercial no encontrada."));

        if (request.IsActive) entity.Activate(); else entity.Deactivate();
        return Result.Success();
    }
}
