using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.PhysicalCounts;

public sealed record AddCountLineCommand(
    Guid PhysicalCountId, Guid ProductId, decimal ExpectedQuantity, string? Notes) : IRequest<Result>;

public sealed class AddCountLineCommandHandler(IPhysicalCountRepository repository)
    : IRequestHandler<AddCountLineCommand, Result>
{
    public async Task<Result> Handle(AddCountLineCommand request, CancellationToken ct)
    {
        var count = await repository.GetWithLinesAsync(request.PhysicalCountId, ct);
        if (count is null)
            return Result.Failure(Error.NotFound("count.notfound", "Conteo no encontrado."));
        if (count.Status != "DRAFT" && count.Status != "IN_PROGRESS")
            return Result.Failure(Error.Conflict("count.closed", "El conteo ya está cerrado."));

        count.Lines.Add(new PhysicalCountLine(
            Guid.NewGuid(), count.Id, request.ProductId, request.ExpectedQuantity, request.Notes?.Trim()));

        repository.Update(count);
        return Result.Success();
    }
}
