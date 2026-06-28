using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Commands.Subbrands;

public sealed record SetSubbrandStatusCommand(Guid Id, Guid CompanyId, bool IsActive) : IRequest<Result>;

public sealed class SetSubbrandStatusCommandHandler(ISubbrandRepository repository)
    : IRequestHandler<SetSubbrandStatusCommand, Result>
{
    public async Task<Result> Handle(SetSubbrandStatusCommand request, CancellationToken ct)
    {
        var subbrand = await repository.GetByIdAsync(request.Id, ct);
        if (subbrand is null || subbrand.CompanyId != request.CompanyId)
            return Result.Failure(Error.NotFound("subbrand.notfound", "Submarca no encontrada."));

        if (request.IsActive) subbrand.Activate();
        else subbrand.Deactivate();

        repository.Update(subbrand);
        return Result.Success();
    }
}
