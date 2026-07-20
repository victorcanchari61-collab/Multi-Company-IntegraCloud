using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class AddErpCatalogViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Cada catálogo de Productos pasa a ser un SUBMÓDULO (view) navegable bajo el módulo 'productos'.
            migrationBuilder.Sql(@"
                INSERT INTO platform.views (""Id"", module_id, code, name, route)
                SELECT gen_random_uuid(), m.""Id"", v.code, v.name, v.route
                FROM platform.modules m
                JOIN platform.systems s ON s.""Id"" = m.system_id
                CROSS JOIN (VALUES
                    ('categorias',    'Categorías',    '/erp/categorias'),
                    ('subcategorias', 'Subcategorías', '/erp/subcategorias'),
                    ('marcas',        'Marcas',        '/erp/marcas'),
                    ('submarcas',     'Submarcas',     '/erp/submarcas')
                ) AS v(code, name, route)
                WHERE s.code = 'ERP' AND m.code = 'productos'
                  AND NOT EXISTS (
                      SELECT 1 FROM platform.views x WHERE x.module_id = m.""Id"" AND x.code = v.code
                  );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM platform.views v
                USING platform.modules m JOIN platform.systems s ON s.""Id"" = m.system_id
                WHERE v.module_id = m.""Id"" AND s.code = 'ERP' AND m.code = 'productos'
                  AND v.code IN ('categorias','subcategorias','marcas','submarcas');
            ");
        }
    }
}
