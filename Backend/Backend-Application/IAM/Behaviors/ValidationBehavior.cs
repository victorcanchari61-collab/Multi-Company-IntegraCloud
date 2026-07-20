using MediatR;
using Backend.SharedKernel;

namespace Backend.Application.IAM.Behaviors;

public sealed class ValidationBehavior<TRequest, TResponse>(
    IEnumerable<FluentValidation.IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (!validators.Any())
            return await next();

        var context = new FluentValidation.ValidationContext<TRequest>(request);
        var failures = validators
            .Select(v => v.Validate(context))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Count != 0)
            throw new ValidationException(failures);

        return await next();
    }
}

public sealed class ValidationException(List<FluentValidation.Results.ValidationFailure> failures)
    : Exception("One or more validation failures have occurred.")
{
    public IReadOnlyCollection<FluentValidation.Results.ValidationFailure> Failures { get; } = failures;
}
