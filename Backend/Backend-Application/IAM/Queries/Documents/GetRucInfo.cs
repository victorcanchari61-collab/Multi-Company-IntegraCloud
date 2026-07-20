using Backend.Domain.IAM.Services;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Documents;

public sealed record GetRucInfoQuery(string Ruc) : IRequest<Result<RucInfo>>;

public sealed class GetRucInfoQueryHandler(IDocumentLookupService lookup)
    : IRequestHandler<GetRucInfoQuery, Result<RucInfo>>
{
    public async Task<Result<RucInfo>> Handle(GetRucInfoQuery request, CancellationToken ct)
    {
        var info = await lookup.GetRucAsync(request.Ruc, ct);
        return info is null
            ? Result<RucInfo>.Failure(Error.NotFound("ruc.not_found", $"No se encontró el RUC {request.Ruc}."))
            : Result<RucInfo>.Success(info);
    }
}
