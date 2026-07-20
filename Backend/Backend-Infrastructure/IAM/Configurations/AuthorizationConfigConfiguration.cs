using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class AuthorizationConfigConfiguration : IEntityTypeConfiguration<AuthorizationConfig>
{
    public void Configure(EntityTypeBuilder<AuthorizationConfig> builder)
    {
        builder.ToTable("authorization_configs", "iam");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RoleId).HasColumnName("role_id").IsRequired();
        builder.Property(x => x.Module).HasColumnName("module").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Action).HasColumnName("action").HasMaxLength(200).IsRequired();
        builder.Property(x => x.TipoAutorizador).HasColumnName("tipo_autorizador").HasMaxLength(30).HasDefaultValue("usuario");
        builder.Property(x => x.AutorizadorId).HasColumnName("autorizador_id");
        builder.Property(x => x.CargoAutorizador).HasColumnName("cargo_autorizador").HasMaxLength(200);
        builder.Property(x => x.RoleAutorizadorId).HasColumnName("role_autorizador_id");
        builder.Property(x => x.RequiereAutorizacion).HasColumnName("requiere_autorizacion").HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(x => x.Role)
            .WithMany()
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.RoleId, x.Module, x.Action }).IsUnique();
    }
}
