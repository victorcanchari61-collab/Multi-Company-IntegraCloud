using Backend.Domain.ERP.Entities.Ventas;
using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.SalesCommissions;

public sealed record CreateSalesCommissionCommand(
    Guid CompanyId, string Code, string Name, string? SalesAgentName, decimal CommissionRate) : IRequest<Result<Guid>>;

public sealed class CreateSalesCommissionCommandHandler(ISalesCommissionRepository repository)
    : IRequestHandler<CreateSalesCommissionCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateSalesCommissionCommand request, CancellationToken ct)
    {
        if (await repository.ExistsByCodeAsync(request.CompanyId, request.Code, null, ct))
            return Result<Guid>.Failure(Error.Conflict("sales_commission.duplicate_code",
                $"Ya existe una comisión con el código '{request.Code}'."));

        var entity = new SalesCommission(Guid.NewGuid(), request.CompanyId, request.Code, request.Name,
            request.SalesAgentName, request.CommissionRate);

        await repository.AddAsync(entity, ct);
        return Result<Guid>.Success(entity.Id);
    }
}
