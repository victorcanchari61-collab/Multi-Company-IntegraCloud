using Backend.Application.ERP.DTOs;
using Backend.Domain.ERP.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.ERP.Queries.Subcategories;

public sealed record GetSubcategoriesQuery(Guid CompanyId, Guid? CategoryId = null) : IRequest<Result<List<SubcategoryDto>>>;

public sealed class GetSubcategoriesQueryHandler(ISubcategoryRepository repository)
    : IRequestHandler<GetSubcategoriesQuery, Result<List<SubcategoryDto>>>
{
    public async Task<Result<List<SubcategoryDto>>> Handle(GetSubcategoriesQuery request, CancellationToken ct)
    {
        var subcategories = await repository.GetByCompanyAsync(request.CompanyId, ct);

        if (request.CategoryId.HasValue)
            subcategories = subcategories.Where(s => s.CategoryId == request.CategoryId.Value).ToList();

        var dtos = subcategories
            .Select(s => new SubcategoryDto(s.Id, s.CategoryId, s.Category.Name, s.Name, s.Description, s.IsActive))
            .ToList();
        return Result<List<SubcategoryDto>>.Success(dtos);
    }
}
