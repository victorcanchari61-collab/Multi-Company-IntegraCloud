using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class AddKardexView : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Kárdex contable: submódulo (view) del módulo Inventario del ERP.
            migrationBuilder.Sql(@"
                INSERT INTO platform.views (""Id"", module_id, code, name, route)
                SELECT gen_random_uuid(), m.""Id"", 'kardex', 'Kárdex contable', '/erp/inventario/kardex'
                FROM platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE s.code = 'ERP' AND m.code = 'inventario'
                  AND NOT EXISTS (SELECT 1 FROM platform.views v WHERE v.module_id = m.""Id"" AND v.code = 'kardex');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM platform.views v
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE v.module_id = m.""Id"" AND s.code = 'ERP' AND m.code = 'inventario' AND v.code = 'kardex';
            ");
        }
    }
}
