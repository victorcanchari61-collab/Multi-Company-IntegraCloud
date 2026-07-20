using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class AuthorizationRequestConfiguration : IEntityTypeConfiguration<AuthorizationRequest>
{
    public void Configure(EntityTypeBuilder<AuthorizationRequest> builder)
    {
        builder.ToTable("authorization_requests", "iam");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(x => x.Module).HasColumnName("module").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Action).HasColumnName("action").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Estado).HasColumnName("estado").HasMaxLength(30).HasDefaultValue("pendiente");
        builder.Property(x => x.AutorizadorId).HasColumnName("autorizador_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
