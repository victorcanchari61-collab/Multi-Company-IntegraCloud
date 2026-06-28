using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class RestructureErpProductsCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Reestructura ERP: "units" pasa de módulo plano a SUBMÓDULO (view) del módulo "Productos".
            migrationBuilder.Sql(@"
                -- 1. Módulo Productos bajo ERP
                INSERT INTO platform.modules (""Id"", system_id, code, name, is_active, created_at)
                SELECT gen_random_uuid(), s.""Id"", 'productos', 'Productos', true, now()
                FROM platform.systems s
                WHERE s.code = 'ERP'
                  AND NOT EXISTS (SELECT 1 FROM platform.modules m WHERE m.system_id = s.""Id"" AND m.code = 'productos');

                -- 2. Submódulo (view) Unidades de medida bajo Productos
                INSERT INTO platform.views (""Id"", module_id, code, name, route)
                SELECT gen_random_uuid(), m.""Id"", 'unidades', 'Unidades de medida', '/erp/unidades'
                FROM platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE s.code = 'ERP' AND m.code = 'productos'
                  AND NOT EXISTS (SELECT 1 FROM platform.views v WHERE v.module_id = m.""Id"" AND v.code = 'unidades');

                -- 3. Migrar licenciamiento: quien tenía 'units' ahora tiene 'productos'
                UPDATE platform.company_module_access
                SET module_id = (SELECT m.""Id"" FROM platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id WHERE s.code='ERP' AND m.code='productos')
                WHERE module_id IN (SELECT m.""Id"" FROM platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id WHERE s.code='ERP' AND m.code='units');

                -- 4. Borrar el módulo plano 'units'
                DELETE FROM platform.modules m USING platform.systems s
                WHERE m.system_id = s.""Id"" AND s.code = 'ERP' AND m.code = 'units';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Recrear módulo plano 'units'
                INSERT INTO platform.modules (""Id"", system_id, code, name, is_active, created_at)
                SELECT gen_random_uuid(), s.""Id"", 'units', 'Unidades de medida', true, now()
                FROM platform.systems s
                WHERE s.code = 'ERP'
                  AND NOT EXISTS (SELECT 1 FROM platform.modules m WHERE m.system_id = s.""Id"" AND m.code = 'units');

                UPDATE platform.company_module_access
                SET module_id = (SELECT m.""Id"" FROM platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id WHERE s.code='ERP' AND m.code='units')
                WHERE module_id IN (SELECT m.""Id"" FROM platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id WHERE s.code='ERP' AND m.code='productos');

                DELETE FROM platform.views v USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE v.module_id = m.""Id"" AND s.code='ERP' AND m.code='productos' AND v.code='unidades';

                DELETE FROM platform.modules m USING platform.systems s
                WHERE m.system_id = s.""Id"" AND s.code = 'ERP' AND m.code = 'productos';
            ");
        }
    }
}
