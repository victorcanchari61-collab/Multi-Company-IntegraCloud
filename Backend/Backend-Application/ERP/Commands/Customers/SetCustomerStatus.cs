using Backend.Domain.ERP.Repositories.Ventas;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Customers;

public sealed record SetCustomerStatusCommand(Guid Id, Guid CompanyId, bool IsActive) : IRequest<Result>;

public sealed class SetCustomerStatusCommandHandler(ICustomerRepository repository)
    : IRequestHandler<SetCustomerStatusCommand, Result>
{
    public async Task<Result> Handle(SetCustomerStatusCommand request, CancellationToken ct)
    {
        var entity = await repository.GetByIdAsync(request.Id, ct);
        if (entity == null || entity.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("customer.not_found", "Cliente no encontrado."));

        if (request.IsActive) entity.Activate(); else entity.Deactivate();
        return Result.Success();
    }
}
