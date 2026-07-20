using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PhysicalCounts;

public sealed record CancelPhysicalCountCommand(Guid Id, Guid CompanyId) : IRequest<Result>;

public sealed class CancelPhysicalCountCommandHandler(IPhysicalCountRepository repository)
    : IRequestHandler<CancelPhysicalCountCommand, Result>
{
    public async Task<Result> Handle(CancelPhysicalCountCommand request, CancellationToken ct)
    {
        var count = await repository.GetByIdAsync(request.Id, ct);
        if (count is null || count.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("count.notfound", "Conteo no encontrado."));
        if (count.Status == "APPROVED" || count.Status == "CANCELLED")
            return Result.Failure(Error.Conflict("count.closed", "El conteo ya fue aprobado o cancelado."));

        count.Cancel();
        repository.Update(count);
        return Result.Success();
    }
}
