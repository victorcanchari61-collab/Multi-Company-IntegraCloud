using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class BuildFullWmsStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- 1. Los 10 módulos del WMS (idempotente).
                INSERT INTO platform.modules (""Id"", system_id, code, name, is_active, created_at)
                SELECT gen_random_uuid(), s.""Id"", v.code, v.name, true, now()
                FROM platform.systems s
                CROSS JOIN (VALUES
                    ('recepcion',          'Recepción'),
                    ('almacenamiento',     'Almacenamiento'),
                    ('inventario-fisico',  'Inventario físico'),
                    ('picking',            'Picking'),
                    ('packing',            'Packing'),
                    ('despacho',           'Despacho'),
                    ('logistica-inversa',  'Logística inversa'),
                    ('transportistas',     'Transportistas'),
                    ('productos-wms',      'Productos (atributos WMS)'),
                    ('reportes-operativos','Reportes operativos')
                ) AS v(code, name)
                WHERE s.code = 'WMS'
                  AND NOT EXISTS (SELECT 1 FROM platform.modules m WHERE m.system_id = s.""Id"" AND m.code = v.code);

                -- 2. Limpia las views WMS previas (se reconstruyen desde el doc).
                DELETE FROM platform.views v
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE v.module_id = m.""Id"" AND s.code = 'WMS';

                -- 3. Todos los submódulos (views) exactos del doc. Ruta = /wms/<modulo>/<submodulo>.
                INSERT INTO platform.views (""Id"", module_id, code, name, route)
                SELECT gen_random_uuid(), m.""Id"", v.view_code, v.view_name, '/wms/' || v.module_code || '/' || v.view_code
                FROM platform.modules m
                JOIN platform.systems s ON s.""Id"" = m.system_id
                JOIN (VALUES
                    ('recepcion','muelle-entrada','Muelle de entrada'),
                    ('recepcion','verificacion-oc','Verificación vs orden de compra'),
                    ('recepcion','control-calidad','Control de calidad'),
                    ('recepcion','etiquetado','Etiquetado y codificación'),
                    ('recepcion','devoluciones-clientes','Devoluciones de clientes'),
                    ('almacenamiento','ubicaciones','Ubicaciones'),
                    ('almacenamiento','zonas','Zonas de almacén'),
                    ('almacenamiento','reglas-ubicacion','Reglas de ubicación'),
                    ('almacenamiento','lotes-series','Gestión de lotes y series'),
                    ('almacenamiento','vencimientos','Fechas de vencimiento'),
                    ('almacenamiento','temperatura','Control de temperatura'),
                    ('inventario-fisico','stock-ubicacion','Stock por ubicación'),
                    ('inventario-fisico','conteos-ciclicos','Conteos cíclicos'),
                    ('inventario-fisico','inventario-general','Inventario general'),
                    ('inventario-fisico','diferencias-ajustes','Diferencias y ajustes físicos'),
                    ('inventario-fisico','trazabilidad','Trazabilidad de movimientos'),
                    ('picking','ordenes-picking','Órdenes de picking'),
                    ('picking','asignacion-operarios','Asignación de operarios'),
                    ('picking','rutas-picking','Rutas de picking optimizadas'),
                    ('picking','picking-lote-zona','Picking por lote / zona'),
                    ('picking','confirmacion-escaner','Confirmación con escáner'),
                    ('packing','verificacion-bultos','Verificación de bultos'),
                    ('packing','empaque-tipo','Empaque por tipo de producto'),
                    ('packing','packing-list','Generación de packing list'),
                    ('packing','peso-dimensiones','Peso y dimensiones'),
                    ('packing','etiquetas-envio','Etiquetas de envío'),
                    ('despacho','ordenes-salida','Órdenes de salida'),
                    ('despacho','asignacion-transportista','Asignación de transportista'),
                    ('despacho','guias-remision','Guías de remisión'),
                    ('despacho','manifiestos','Manifiestos de carga'),
                    ('despacho','confirmacion-envio','Confirmación de envío'),
                    ('logistica-inversa','devoluciones','Devoluciones de clientes'),
                    ('logistica-inversa','inspeccion-retorno','Inspección de retorno'),
                    ('logistica-inversa','reingreso-stock','Reingreso al stock'),
                    ('logistica-inversa','productos-danados','Productos dañados / merma'),
                    ('transportistas','ficha-transportista','Ficha de transportista'),
                    ('transportistas','vehiculos','Vehículos'),
                    ('transportistas','rutas-asignadas','Rutas asignadas'),
                    ('transportistas','tarifas-flete','Tarifas de flete'),
                    ('transportistas','seguimiento-entregas','Seguimiento de entregas'),
                    ('productos-wms','dimensiones-peso','Dimensiones y peso'),
                    ('productos-wms','tipo-almacenamiento','Tipo de almacenamiento'),
                    ('productos-wms','fragilidad','Fragilidad / peligrosidad'),
                    ('productos-wms','cantidad-pallet','Cantidad por pallet'),
                    ('productos-wms','imagen-ubicacion','Imagen de ubicación'),
                    ('reportes-operativos','ocupacion','Ocupación del almacén'),
                    ('reportes-operativos','productividad','Productividad por operario'),
                    ('reportes-operativos','tiempo-ciclo','Tiempo de ciclo'),
                    ('reportes-operativos','tasa-error-picking','Tasa de error de picking'),
                    ('reportes-operativos','movimientos-periodo','Movimientos por período')
                ) AS v(module_code, view_code, view_name) ON v.module_code = m.code
                WHERE s.code = 'WMS';

                -- 4. Permisos por cada módulo WMS (module × action). Idempotente.
                INSERT INTO platform.permissions (""Id"", key, module_id, action_code, description)
                SELECT gen_random_uuid(), 'wms.' || m.code || '.' || a.code, m.""Id"", a.code, a.name || ' ' || m.name
                FROM platform.modules m
                JOIN platform.systems s ON s.""Id"" = m.system_id
                CROSS JOIN platform.actions a
                WHERE s.code = 'WMS'
                  AND NOT EXISTS (
                      SELECT 1 FROM platform.permissions p WHERE p.module_id = m.""Id"" AND p.action_code = a.code
                  );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM platform.views v
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE v.module_id = m.""Id"" AND s.code = 'WMS';

                DELETE FROM platform.permissions p
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE p.module_id = m.""Id"" AND s.code = 'WMS'
                  AND m.code IN ('logistica-inversa','transportistas','productos-wms','reportes-operativos');

                DELETE FROM platform.company_module_access cma
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE cma.module_id = m.""Id"" AND s.code = 'WMS'
                  AND m.code IN ('logistica-inversa','transportistas','productos-wms','reportes-operativos');

                DELETE FROM platform.modules m
                USING platform.systems s
                WHERE m.system_id = s.""Id"" AND s.code = 'WMS'
                  AND m.code IN ('logistica-inversa','transportistas','productos-wms','reportes-operativos');
            ");
        }
    }
}
