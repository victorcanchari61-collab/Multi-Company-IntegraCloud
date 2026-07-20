using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class RoleRestrictionConfiguration : IEntityTypeConfiguration<RoleRestriction>
{
    public void Configure(EntityTypeBuilder<RoleRestriction> builder)
    {
        builder.ToTable("role_restrictions", "iam");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RoleId).HasColumnName("role_id").IsRequired();
        builder.Property(x => x.RestrictedKey).HasColumnName("restricted_key").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Effect).HasColumnName("effect").HasMaxLength(30).IsRequired().HasDefaultValue("deny");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(x => x.Role)
            .WithMany(r => r.Restrictions)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.RoleId, x.RestrictedKey }).IsUnique();
    }
}
