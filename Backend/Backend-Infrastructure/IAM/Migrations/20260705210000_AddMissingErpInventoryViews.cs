using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingErpInventoryViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Agrega las vistas faltantes al módulo ERP/Inventario para que coincida
                -- con el explorador de sistemas (11 submódulos de Inventario control contable).
                -- Algunas de estas vistas ya existen como rutas en WMS (reservas), otras son nuevas
                -- (valorización, reposición, costo promedio, ajustes).

                INSERT INTO platform.views (""Id"", module_id, code, name, route)
                SELECT gen_random_uuid(), m.""Id"", v.code, v.name, v.route
                FROM platform.modules m
                JOIN platform.systems s ON s.""Id"" = m.system_id
                CROSS JOIN (VALUES
                    ('costo-promedio', 'Costo promedio ponderado', '/erp/inventario/costo-promedio'),
                    ('valorizacion',    'Valorización de stock',    '/erp/inventario/valorizacion'),
                    ('reservas',        'Reservas de stock',        '/erp/inventario/reservas'),
                    ('ajustes',         'Ajustes de inventario',    '/erp/inventario/ajustes'),
                    ('reposicion',      'Niveles de reposición',    '/erp/inventario/reposicion'),
                    ('kardex',          'Kárdex contable',          '/erp/inventario/kardex')
                ) AS v(code, name, route)
                WHERE s.code = 'ERP' AND m.code = 'inventario'
                  AND NOT EXISTS (
                      SELECT 1 FROM platform.views x WHERE x.module_id = m.""Id"" AND x.code = v.code
                  );

                -- Actualiza rutas de vistas existentes que aún apuntan a la ruta antigua (duplicada)
                UPDATE platform.views SET route = '/erp/inventario/ajustes'
                FROM platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE module_id = m.""Id"" AND s.code = 'ERP' AND m.code = 'inventario'
                  AND code = 'ajustes' AND route = '/erp/inventario/movimientos';

                UPDATE platform.views SET route = '/erp/inventario/costo-promedio'
                FROM platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE module_id = m.""Id"" AND s.code = 'ERP' AND m.code = 'inventario'
                  AND code = 'costo-promedio' AND route = '/erp/inventario/kardex';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM platform.views v
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE v.module_id = m.""Id"" AND s.code = 'ERP' AND m.code = 'inventario'
                  AND v.code IN ('costo-promedio', 'valorizacion', 'reservas', 'ajustes', 'reposicion', 'kardex');
            ");
        }
    }
}
