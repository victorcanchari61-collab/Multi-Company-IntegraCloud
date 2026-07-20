using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Locations;

public sealed record CreateLocationCommand(
    Guid CompanyId, Guid WarehouseId, string Code, string? Description, string? Zone, Guid? ParentId) : IRequest<Result<Guid>>;

public sealed class CreateLocationCommandHandler(ILocationRepository repository)
    : IRequestHandler<CreateLocationCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateLocationCommand request, CancellationToken ct)
    {
        var location = new Location(Guid.NewGuid(), request.CompanyId, request.WarehouseId,
            request.Code.Trim(), request.Description?.Trim(), request.Zone?.Trim(), request.ParentId);
        await repository.AddAsync(location, ct);
        return Result<Guid>.Success(location.Id);
    }
}
