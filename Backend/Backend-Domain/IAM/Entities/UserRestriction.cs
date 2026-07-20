using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

/// <summary>Restricción (blacklist) directa sobre un usuario, adicional a las heredadas de sus roles.</summary>
public sealed class UserRestriction : Entity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public string RestrictedKey { get; private set; } = null!;
    public string Effect { get; private set; } = "deny";
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    private UserRestriction() { }

    public UserRestriction(Guid userId, string restrictedKey) : base(Guid.NewGuid())
    {
        UserId = userId;
        RestrictedKey = restrictedKey;
    }
}
