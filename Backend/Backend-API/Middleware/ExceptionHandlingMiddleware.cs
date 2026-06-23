using System.Net;
using System.Text.Json;
using Backend.Application.IAM.Behaviors;
using Backend.SharedKernel;

namespace Backend_API.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";

            var errors = ex.Failures.Select(f => new
            {
                field = f.PropertyName,
                message = f.ErrorMessage
            });

            var result = JsonSerializer.Serialize(new { errors });
            await context.Response.WriteAsync(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            var result = JsonSerializer.Serialize(new
            {
                error = new { code = "internal.error", message = "An internal error occurred." }
            });
            await context.Response.WriteAsync(result);
        }
    }
}
