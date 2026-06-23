using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class UserRole : Entity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public Guid RoleId { get; private set; }
    public Role Role { get; private set; } = null!;

    private UserRole() { }

    public UserRole(Guid userId, Guid roleId) : base(Guid.NewGuid())
    {
        UserId = userId;
        RoleId = roleId;
    }
}
