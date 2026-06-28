using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class CatalogModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "brands",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_brands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "categories",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "subbrands",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    brand_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_subbrands", x => x.Id);
                    table.ForeignKey(
                        name: "FK_subbrands_brands_brand_id",
                        column: x => x.brand_id,
                        principalSchema: "erp",
                        principalTable: "brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "subcategories",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_subcategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_subcategories_categories_category_id",
                        column: x => x.category_id,
                        principalSchema: "erp",
                        principalTable: "categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "products",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    sku = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    barcode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    category_id = table.Column<Guid>(type: "uuid", nullable: true),
                    subcategory_id = table.Column<Guid>(type: "uuid", nullable: true),
                    brand_id = table.Column<Guid>(type: "uuid", nullable: true),
                    subbrand_id = table.Column<Guid>(type: "uuid", nullable: true),
                    unit_of_measure_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sale_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    cost_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_products_brands_brand_id",
                        column: x => x.brand_id,
                        principalSchema: "erp",
                        principalTable: "brands",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_products_categories_category_id",
                        column: x => x.category_id,
                        principalSchema: "erp",
                        principalTable: "categories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_products_subbrands_subbrand_id",
                        column: x => x.subbrand_id,
                        principalSchema: "erp",
                        principalTable: "subbrands",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_products_subcategories_subcategory_id",
                        column: x => x.subcategory_id,
                        principalSchema: "erp",
                        principalTable: "subcategories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_products_units_of_measure_unit_of_measure_id",
                        column: x => x.unit_of_measure_id,
                        principalSchema: "erp",
                        principalTable: "units_of_measure",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_brands_company_id",
                schema: "erp",
                table: "brands",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_brands_company_id_name",
                schema: "erp",
                table: "brands",
                columns: new[] { "company_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_categories_company_id",
                schema: "erp",
                table: "categories",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_categories_company_id_name",
                schema: "erp",
                table: "categories",
                columns: new[] { "company_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_products_brand_id",
                schema: "erp",
                table: "products",
                column: "brand_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_category_id",
                schema: "erp",
                table: "products",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_company_id",
                schema: "erp",
                table: "products",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_company_id_sku",
                schema: "erp",
                table: "products",
                columns: new[] { "company_id", "sku" },
                unique: true,
                filter: "\"sku\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_products_subbrand_id",
                schema: "erp",
                table: "products",
                column: "subbrand_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_subcategory_id",
                schema: "erp",
                table: "products",
                column: "subcategory_id");

            migrationBuilder.CreateIndex(
                name: "IX_products_unit_of_measure_id",
                schema: "erp",
                table: "products",
                column: "unit_of_measure_id");

            migrationBuilder.CreateIndex(
                name: "IX_subbrands_brand_id",
                schema: "erp",
                table: "subbrands",
                column: "brand_id");

            migrationBuilder.CreateIndex(
                name: "IX_subbrands_company_id_brand_id_name",
                schema: "erp",
                table: "subbrands",
                columns: new[] { "company_id", "brand_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_subcategories_category_id",
                schema: "erp",
                table: "subcategories",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_subcategories_company_id_category_id_name",
                schema: "erp",
                table: "subcategories",
                columns: new[] { "company_id", "category_id", "name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "products",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "subbrands",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "subcategories",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "brands",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "categories",
                schema: "erp");
        }
    }
}
