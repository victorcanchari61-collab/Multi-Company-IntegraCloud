using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PhysicalCounts;

public sealed record CompletePhysicalCountCommand(Guid Id, Guid CompanyId, Guid UserId) : IRequest<Result>;

public sealed class CompletePhysicalCountCommandHandler(IPhysicalCountRepository repository)
    : IRequestHandler<CompletePhysicalCountCommand, Result>
{
    public async Task<Result> Handle(CompletePhysicalCountCommand request, CancellationToken ct)
    {
        var count = await repository.GetByIdAsync(request.Id, ct);
        if (count is null || count.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("count.notfound", "Conteo no encontrado."));
        if (count.Status != "IN_PROGRESS")
            return Result.Failure(Error.Conflict("count.invalid_status", "El conteo debe estar en progreso para completarse."));

        count.Complete(request.UserId);
        repository.Update(count);
        return Result.Success();
    }
}
