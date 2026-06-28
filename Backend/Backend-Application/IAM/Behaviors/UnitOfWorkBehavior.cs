using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Behaviors;

/// <summary>
/// Tras ejecutar un request con éxito, confirma los cambios del contexto una sola vez
/// (transacción por request). Si el handler devolvió un Result fallido, no persiste.
/// En queries (sin cambios rastreados) SaveChanges es un no-op barato.
/// </summary>
public sealed class UnitOfWorkBehavior<TRequest, TResponse>(IUnitOfWork unitOfWork)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        var response = await next();

        // Cubre Result y Result<T> (ambos exponen IsSuccess) sin acoplarse al genérico.
        var isSuccess = response?.GetType().GetProperty(nameof(Result.IsSuccess))?.GetValue(response);
        if (isSuccess is false)
            return response;

        await unitOfWork.SaveChangesAsync(ct);
        return response;
    }
}
