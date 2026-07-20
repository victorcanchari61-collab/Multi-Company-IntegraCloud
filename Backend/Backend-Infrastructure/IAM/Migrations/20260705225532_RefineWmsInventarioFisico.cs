using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class RefineWmsInventarioFisico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Redefine los submódulos del módulo 'Inventario físico' (WMS).
                DELETE FROM platform.views v
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE v.module_id = m.""Id"" AND s.code = 'WMS' AND m.code = 'inventario-fisico';

                INSERT INTO platform.views (""Id"", module_id, code, name, route)
                SELECT gen_random_uuid(), m.""Id"", v.code, v.name, '/wms/inventario-fisico/' || v.code
                FROM platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                JOIN (VALUES
                    ('conteos-fisicos', 'Conteos físicos (toma de inventario)'),
                    ('trazabilidad',    'Trazabilidad de movimientos'),
                    ('stock-ubicacion', 'Stock por ubicación'),
                    ('conteos-ciclicos','Conteos cíclicos programados')
                ) AS v(code, name) ON TRUE
                WHERE s.code = 'WMS' AND m.code = 'inventario-fisico';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM platform.views v
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE v.module_id = m.""Id"" AND s.code = 'WMS' AND m.code = 'inventario-fisico';

                INSERT INTO platform.views (""Id"", module_id, code, name, route)
                SELECT gen_random_uuid(), m.""Id"", v.code, v.name, '/wms/inventario-fisico/' || v.code
                FROM platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                JOIN (VALUES
                    ('stock-ubicacion',    'Stock por ubicación'),
                    ('conteos-ciclicos',   'Conteos cíclicos'),
                    ('inventario-general', 'Inventario general'),
                    ('diferencias-ajustes','Diferencias y ajustes físicos'),
                    ('trazabilidad',       'Trazabilidad de movimientos')
                ) AS v(code, name) ON TRUE
                WHERE s.code = 'WMS' AND m.code = 'inventario-fisico';
            ");
        }
    }
}
