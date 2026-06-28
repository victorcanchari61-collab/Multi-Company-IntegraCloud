using Backend.Application.IAM.DTOs;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Queries.Menu;

public sealed record GetOwnerMenuQuery() : IRequest<Result<List<MenuSectionDto>>>;

public sealed class GetOwnerMenuQueryHandler
    : IRequestHandler<GetOwnerMenuQuery, Result<List<MenuSectionDto>>>
{
    public Task<Result<List<MenuSectionDto>>> Handle(GetOwnerMenuQuery request, CancellationToken ct)
    {
        var sections = new List<MenuSectionDto>
        {
            new("IAM", "IAM", new List<MenuItemDto>
            {
                new("companies", "Empresas", "/iam/companies"),
            }),
        };

        return Task.FromResult(Result<List<MenuSectionDto>>.Success(sections));
    }
}
