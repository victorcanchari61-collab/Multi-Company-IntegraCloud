using Backend.SharedKernel;

namespace Backend.Domain.IAM.Entities;

public sealed class User : AggregateRoot
{
    public Guid? CompanyId { get; private set; }
    public Company? Company { get; private set; }
    public string Email { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public string FullName { get; private set; } = null!;
    public int Status { get; private set; } = 1; // 1=Active, 2=Suspended
    public bool IsOwner { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public ICollection<UserRole> UserRoles { get; private set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; private set; } = [];

    private User() { }

    public User(Guid id, Guid? companyId, string email, string passwordHash,
        string fullName, bool isOwner)
        : base(id)
    {
        CompanyId = companyId;
        Email = email;
        PasswordHash = passwordHash;
        FullName = fullName;
        IsOwner = isOwner;

        if (companyId is null && !isOwner)
            throw new InvalidOperationException("User without CompanyId must be Owner.");

        if (companyId is not null && isOwner)
            throw new InvalidOperationException("Owner cannot belong to a company.");
    }

    public void Suspend() => Status = 2;
    public void Activate() => Status = 1;
}
