using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class RegisterErpUnitsModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Registra el módulo "units" (Unidades de medida) bajo el sistema ERP.
            // Idempotente: no inserta si ya existe.
            migrationBuilder.Sql(@"
                INSERT INTO platform.modules (""Id"", system_id, code, name, is_active, created_at)
                SELECT gen_random_uuid(), s.""Id"", 'units', 'Unidades de medida', true, now()
                FROM platform.systems s
                WHERE s.code = 'ERP'
                  AND NOT EXISTS (
                      SELECT 1 FROM platform.modules m
                      WHERE m.system_id = s.""Id"" AND m.code = 'units'
                  );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM platform.modules m
                USING platform.systems s
                WHERE m.system_id = s.""Id"" AND s.code = 'ERP' AND m.code = 'units';
            ");
        }
    }
}
