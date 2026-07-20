using Backend.Domain.ERP.Repositories.Compras;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Suppliers;

public sealed record SetSupplierStatusCommand(Guid Id, Guid CompanyId, bool IsActive) : IRequest<Result>;

public sealed class SetSupplierStatusCommandHandler(ISupplierRepository repository)
    : IRequestHandler<SetSupplierStatusCommand, Result>
{
    public async Task<Result> Handle(SetSupplierStatusCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("supplier.not_found", "Proveedor no encontrado."));

        if (request.IsActive) entity.Activate(); else entity.Deactivate();
        return Result.Success();
    }
}
