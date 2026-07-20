using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.SalesCommissions;

public sealed record SetSalesCommissionStatusCommand(Guid Id, Guid CompanyId, bool IsActive) : IRequest<Result>;

public sealed class SetSalesCommissionStatusCommandHandler(ISalesCommissionRepository repository)
    : IRequestHandler<SetSalesCommissionStatusCommand, Result>
{
    public async Task<Result> Handle(SetSalesCommissionStatusCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("sales_commission.not_found", "Comisión no encontrada."));

        if (request.IsActive) entity.Activate(); else entity.Deactivate();
        return Result.Success();
    }
}
