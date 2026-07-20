using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.SalesCommissions;

public sealed record UpdateSalesCommissionCommand(
    Guid Id, Guid CompanyId, string Code, string Name,
    string? SalesAgentName, decimal CommissionRate) : IRequest<Result>;

public sealed class UpdateSalesCommissionCommandHandler(ISalesCommissionRepository repository)
    : IRequestHandler<UpdateSalesCommissionCommand, Result>
{
    public async Task<Result> Handle(UpdateSalesCommissionCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("sales_commission.not_found", "Comisión no encontrada."));

        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code, request.Id, ct))
            return Result.Failure(Error.Conflict("sales_commission.duplicate_code",
                $"Ya existe una comisión con el código '{request.Code}'."));

        entity.Update(request.Code, request.Name, request.SalesAgentName, request.CommissionRate);
        repository.Update(entity);
        return Result.Success();
    }
}
