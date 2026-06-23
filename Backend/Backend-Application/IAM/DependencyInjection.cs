using Backend.Application.IAM.Behaviors;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Backend.Application.IAM;

public static class DependencyInjection
{
    public static IServiceCollection AddIamApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);

            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });

        return services;
    }
}
