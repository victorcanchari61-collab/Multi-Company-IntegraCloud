using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Locations;

public sealed record DeleteLocationCommand(Guid Id) : IRequest<Result>;

public sealed class DeleteLocationCommandHandler(ILocationRepository repository)
    : IRequestHandler<DeleteLocationCommand, Result>
{
    public async Task<Result> Handle(DeleteLocationCommand request, CancellationToken ct)
    {
        var location = await repository.GetByIdAsync(request.Id, ct);
        if (location is null)
            return Result.Failure(Error.NotFound("location.notfound", "Ubicación no encontrada."));
        repository.Delete(location);
        return Result.Success();
    }
}
