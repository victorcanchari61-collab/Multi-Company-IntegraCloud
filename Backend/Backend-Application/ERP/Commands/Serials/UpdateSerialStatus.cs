using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Serials;

public sealed record UpdateSerialStatusCommand(
    Guid Id, Guid CompanyId, string Status) : IRequest<Result>;

public sealed class UpdateSerialStatusCommandHandler(ISerialNumberRepository repository)
    : IRequestHandler<UpdateSerialStatusCommand, Result>
{
    public async Task<Result> Handle(UpdateSerialStatusCommand request, CancellationToken ct)
    {
        var serial = await repository.GetByIdAsync(request.Id, ct);
        if (serial is null || serial.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("serial.notfound", "Número de serie no encontrado."));

        switch (request.Status)
        {
            case "SOLD": serial.MarkSold(); break;
            case "RETURNED": serial.MarkReturned(); break;
            case "SCRAPPED": serial.MarkScrapped(); break;
            default: return Result.Failure(Error.Validation("serial.invalid_status", $"Estado inválido: {request.Status}"));
        }

        repository.Update(serial);
        return Result.Success();
    }
}
