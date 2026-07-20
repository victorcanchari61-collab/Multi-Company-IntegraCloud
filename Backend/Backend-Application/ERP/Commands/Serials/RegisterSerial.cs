using Backend.Domain.ERP.Entities;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Serials;

public sealed record RegisterSerialCommand(
    Guid CompanyId, Guid ProductId, Guid? BatchId, string Serial,
    Guid WarehouseId, Guid? LocationId) : IRequest<Result<Guid>>;

public sealed class RegisterSerialCommandHandler(ISerialNumberRepository repository)
    : IRequestHandler<RegisterSerialCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(RegisterSerialCommand request, CancellationToken ct)
    {
        var existing = await repository.GetBySerialAsync(request.CompanyId, request.Serial.Trim(), ct);
        if (existing is not null)
            return Result<Guid>.Failure(Error.Conflict("serial.duplicate", "El número de serie ya está registrado."));

        var serial = new SerialNumber(Guid.NewGuid(), request.CompanyId, request.ProductId,
            request.BatchId, request.Serial.Trim(), request.WarehouseId, request.LocationId);
        await repository.AddAsync(serial, ct);
        return Result<Guid>.Success(serial.Id);
    }
}
