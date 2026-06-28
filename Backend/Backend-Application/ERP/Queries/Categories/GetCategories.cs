using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Categories;

public sealed record GetCategoriesQuery(Guid CompanyId) : IRequest<Result<List<CategoryDto>>>;

public sealed class GetCategoriesQueryHandler(ICategoryRepository repository)
    : IRequestHandler<GetCategoriesQuery, Result<List<CategoryDto>>>
{
    public async Task<Result<List<CategoryDto>>> Handle(GetCategoriesQuery request, CancellationToken ct)
    {
        var categories = await repository.GetByCompanyAsync(request.CompanyId, ct);
        var dtos = categories
            .Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.IsActive))
            .ToList();
        return Result<List<CategoryDto>>.Success(dtos);
    }
}
