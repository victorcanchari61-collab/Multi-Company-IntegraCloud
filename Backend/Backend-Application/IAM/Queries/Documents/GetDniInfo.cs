using Backend.Domain.IAM.Services;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Documents;

public sealed record GetDniInfoQuery(string Dni) : IRequest<Result<DniInfo>>;

public sealed class GetDniInfoQueryHandler(IDocumentLookupService lookup)
    : IRequestHandler<GetDniInfoQuery, Result<DniInfo>>
{
    public async Task<Result<DniInfo>> Handle(GetDniInfoQuery request, CancellationToken ct)
    {
        var info = await lookup.GetDniAsync(request.Dni, ct);
        return info is null
            ? Result<DniInfo>.Failure(Error.NotFound("dni.not_found", $"No se encontró el DNI {request.Dni}."))
            : Result<DniInfo>.Success(info);
    }
}
