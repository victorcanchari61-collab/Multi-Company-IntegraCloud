using Backend.Domain.IAM.Repositories;
using Backend.SharedKernel;
using MediatR;

namespace Backend.Application.IAM.Commands.Auth;

public sealed record LogoutCommand(string RefreshToken) : IRequest<Result>;

public sealed class LogoutCommandHandler(IRefreshTokenRepository refreshTokenRepository)
    : IRequestHandler<LogoutCommand, Result>
{
    public async Task<Result> Handle(LogoutCommand request, CancellationToken ct)
    {
        var token = await refreshTokenRepository.GetByTokenHashAsync(request.RefreshToken, ct);

        if (token is not null)
        {
            token.Revoke();
        }

        return Result.Success();
    }
}
