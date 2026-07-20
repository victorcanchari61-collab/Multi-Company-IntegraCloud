using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class RegisterWmsModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- 1. Módulos del sistema WMS (el sistema ya existe en platform.systems).
                INSERT INTO platform.modules (""Id"", system_id, code, name, is_active, created_at)
                SELECT gen_random_uuid(), s.""Id"", v.code, v.name, true, now()
                FROM platform.systems s
                CROSS JOIN (VALUES
                    ('recepcion',         'Recepción'),
                    ('almacenamiento',    'Almacenamiento'),
                    ('inventario-fisico', 'Inventario físico'),
                    ('picking',           'Picking'),
                    ('packing',           'Packing'),
                    ('despacho',          'Despacho')
                ) AS v(code, name)
                WHERE s.code = 'WMS'
                  AND NOT EXISTS (SELECT 1 FROM platform.modules m WHERE m.system_id = s.""Id"" AND m.code = v.code);

                -- 2. Permisos por cada módulo WMS (module × action). Key = wms.<modulo>.<accion>.
                INSERT INTO platform.permissions (""Id"", key, module_id, action_code, description)
                SELECT gen_random_uuid(), 'wms.' || m.code || '.' || a.code, m.""Id"", a.code, a.name || ' ' || m.name
                FROM platform.modules m
                JOIN platform.systems s ON s.""Id"" = m.system_id
                CROSS JOIN platform.actions a
                WHERE s.code = 'WMS'
                  AND NOT EXISTS (
                      SELECT 1 FROM platform.permissions p WHERE p.module_id = m.""Id"" AND p.action_code = a.code
                  );

                -- 3. Mueve las views operativas de ERP→Inventario a WMS (mismo dato, otro sistema).
                --    Ubicaciones y Lotes/series → WMS → Almacenamiento
                UPDATE platform.views SET
                    module_id = (SELECT m.""Id"" FROM platform.modules m JOIN platform.systems s ON s.""Id""=m.system_id WHERE s.code='WMS' AND m.code='almacenamiento'),
                    route = CASE code
                        WHEN 'ubicaciones'  THEN '/wms/almacenamiento/ubicaciones'
                        WHEN 'lotes-series' THEN '/wms/almacenamiento/lotes-series'
                    END
                WHERE code IN ('ubicaciones','lotes-series')
                  AND module_id = (SELECT m.""Id"" FROM platform.modules m JOIN platform.systems s ON s.""Id""=m.system_id WHERE s.code='ERP' AND m.code='inventario');

                --    Conteos y Reservas → WMS → Inventario físico
                UPDATE platform.views SET
                    module_id = (SELECT m.""Id"" FROM platform.modules m JOIN platform.systems s ON s.""Id""=m.system_id WHERE s.code='WMS' AND m.code='inventario-fisico'),
                    route = CASE code
                        WHEN 'conteos'  THEN '/wms/inventario-fisico/conteos'
                        WHEN 'reservas' THEN '/wms/inventario-fisico/reservas'
                    END
                WHERE code IN ('conteos','reservas')
                  AND module_id = (SELECT m.""Id"" FROM platform.modules m JOIN platform.systems s ON s.""Id""=m.system_id WHERE s.code='ERP' AND m.code='inventario');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Devuelve las views a ERP → Inventario
                UPDATE platform.views SET
                    module_id = (SELECT m.""Id"" FROM platform.modules m JOIN platform.systems s ON s.""Id""=m.system_id WHERE s.code='ERP' AND m.code='inventario'),
                    route = '/erp/inventario/' || code
                WHERE code IN ('ubicaciones','lotes-series','conteos','reservas')
                  AND module_id IN (SELECT m.""Id"" FROM platform.modules m JOIN platform.systems s ON s.""Id""=m.system_id WHERE s.code='WMS');

                DELETE FROM platform.permissions p
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE p.module_id = m.""Id"" AND s.code = 'WMS';

                DELETE FROM platform.company_module_access cma
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE cma.module_id = m.""Id"" AND s.code = 'WMS';

                DELETE FROM platform.modules m
                USING platform.systems s
                WHERE m.system_id = s.""Id"" AND s.code = 'WMS';
            ");
        }
    }
}
