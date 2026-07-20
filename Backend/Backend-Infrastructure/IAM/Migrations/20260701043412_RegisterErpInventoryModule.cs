using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class RegisterErpInventoryModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- 1. Módulo Inventario bajo ERP
                INSERT INTO platform.modules (""Id"", system_id, code, name, is_active, created_at)
                SELECT gen_random_uuid(), s.""Id"", 'inventario', 'Inventario', true, now()
                FROM platform.systems s
                WHERE s.code = 'ERP'
                  AND NOT EXISTS (SELECT 1 FROM platform.modules m WHERE m.system_id = s.""Id"" AND m.code = 'inventario');

                -- 2. Views (submódulos) del Inventario
                INSERT INTO platform.views (""Id"", module_id, code, name, route)
                SELECT gen_random_uuid(), m.""Id"", v.code, v.name, v.route
                FROM platform.modules m
                JOIN platform.systems s ON s.""Id"" = m.system_id
                CROSS JOIN (VALUES
                    ('almacenes',      'Almacenes',         '/erp/inventario/almacenes'),
                    ('stock',          'Stock actual',      '/erp/inventario/stock'),
                    ('movimientos',    'Movimientos',       '/erp/inventario/movimientos'),
                    ('transferencias', 'Transferencias',    '/erp/inventario/transferencias'),
                    ('ubicaciones',    'Ubicaciones',       '/erp/inventario/ubicaciones'),
                    ('lotes-series',   'Lotes y series',    '/erp/inventario/lotes-series'),
                    ('reservas',       'Reservas',          '/erp/inventario/reservas'),
                    ('conteos',        'Conteos físicos',   '/erp/inventario/conteos'),
                    ('reportes',       'Reportes',          '/erp/inventario/reportes')
                ) AS v(code, name, route)
                WHERE s.code = 'ERP' AND m.code = 'inventario'
                  AND NOT EXISTS (
                      SELECT 1 FROM platform.views x WHERE x.module_id = m.""Id"" AND x.code = v.code
                  );

                -- 3. Permisos para el módulo Inventario (module × action)
                INSERT INTO platform.permissions (""Id"", key, module_id, action_code, description)
                SELECT gen_random_uuid(), 'erp.inventario.' || a.code, m.""Id"", a.code, a.name || ' Inventario'
                FROM platform.modules m
                JOIN platform.systems s ON s.""Id"" = m.system_id
                CROSS JOIN platform.actions a
                WHERE s.code = 'ERP' AND m.code = 'inventario'
                  AND NOT EXISTS (
                      SELECT 1 FROM platform.permissions p
                      WHERE p.module_id = m.""Id"" AND p.action_code = a.code
                  );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Eliminar permisos del módulo Inventario
                DELETE FROM platform.permissions p
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE p.module_id = m.""Id"" AND s.code = 'ERP' AND m.code = 'inventario';

                -- Eliminar views del módulo Inventario
                DELETE FROM platform.views v
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE v.module_id = m.""Id"" AND s.code = 'ERP' AND m.code = 'inventario';

                -- Eliminar accesos de empresa al módulo Inventario
                DELETE FROM platform.company_module_access cma
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE cma.module_id = m.""Id"" AND s.code = 'ERP' AND m.code = 'inventario';

                -- Eliminar módulo Inventario
                DELETE FROM platform.modules m
                USING platform.systems s
                WHERE m.system_id = s.""Id"" AND s.code = 'ERP' AND m.code = 'inventario';
            ");
        }
    }
}
