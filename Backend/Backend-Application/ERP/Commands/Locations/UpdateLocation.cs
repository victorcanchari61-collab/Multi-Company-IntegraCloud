using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Locations;

public sealed record UpdateLocationCommand(
    Guid Id, Guid CompanyId, string Code, string? Description, string? Zone, Guid? ParentId) : IRequest<Result>;

public sealed class UpdateLocationCommandHandler(ILocationRepository repository)
    : IRequestHandler<UpdateLocationCommand, Result>
{
    public async Task<Result> Handle(UpdateLocationCommand request, CancellationToken ct)
    {
        var location = await repository.GetByIdAsync(request.Id, ct);
        if (location is null || location.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("location.notfound", "Ubicación no encontrada."));
        location.Update(request.Code.Trim(), request.Description?.Trim(), request.Zone?.Trim(), request.ParentId);
        repository.Update(location);
        return Result.Success();
    }
}
