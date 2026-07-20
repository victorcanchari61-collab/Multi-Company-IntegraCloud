using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PhysicalCounts;

public sealed record RecordCountLineCommand(
    Guid Id, decimal CountedQuantity, string? Notes) : IRequest<Result>;

public sealed class RecordCountLineCommandHandler(IPhysicalCountRepository repository)
    : IRequestHandler<RecordCountLineCommand, Result>
{
    public async Task<Result> Handle(RecordCountLineCommand request, CancellationToken ct)
    {
        var count = await repository.GetWithLinesAsync(request.Id, ct);
        if (count is null)
            return Result.Failure(Error.NotFound("count.notfound", "Conteo no encontrado."));

        var line = count.Lines.FirstOrDefault(l => l.Id == request.Id);
        if (line is null)
            return Result.Failure(Error.NotFound("line.notfound", "Línea de conteo no encontrada."));

        line.RecordCount(request.CountedQuantity, request.Notes?.Trim());
        repository.Update(count);
        return Result.Success();
    }
}
