using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class AddProductPresentationsPriceListsCurrenciesAndLots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "stock_max",
                schema: "erp",
                table: "products",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "stock_min",
                schema: "erp",
                table: "products",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ticket_description",
                schema: "erp",
                table: "products",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "currencies",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    symbol = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_currencies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "price_lists",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "both"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_price_lists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "product_lots",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    expiry_date = table.Column<DateOnly>(type: "date", nullable: true),
                    initial_stock = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_lots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_product_lots_products_product_id",
                        column: x => x.product_id,
                        principalSchema: "erp",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "product_presentations",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    unit_of_measure_id = table.Column<Guid>(type: "uuid", nullable: true),
                    factor = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    is_base = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_presentations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_product_presentations_products_product_id",
                        column: x => x.product_id,
                        principalSchema: "erp",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_product_presentations_units_of_measure_unit_of_measure_id",
                        column: x => x.unit_of_measure_id,
                        principalSchema: "erp",
                        principalTable: "units_of_measure",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "product_prices",
                schema: "erp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    presentation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    price_list_id = table.Column<Guid>(type: "uuid", nullable: false),
                    currency_id = table.Column<Guid>(type: "uuid", nullable: false),
                    purchase_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true),
                    sale_price = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_prices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_product_prices_currencies_currency_id",
                        column: x => x.currency_id,
                        principalSchema: "erp",
                        principalTable: "currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_product_prices_price_lists_price_list_id",
                        column: x => x.price_list_id,
                        principalSchema: "erp",
                        principalTable: "price_lists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_product_prices_product_presentations_presentation_id",
                        column: x => x.presentation_id,
                        principalSchema: "erp",
                        principalTable: "product_presentations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_product_prices_products_product_id",
                        column: x => x.product_id,
                        principalSchema: "erp",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_currencies_company_id_code",
                schema: "erp",
                table: "currencies",
                columns: new[] { "company_id", "code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_price_lists_company_id_name",
                schema: "erp",
                table: "price_lists",
                columns: new[] { "company_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_product_lots_product_id_number",
                schema: "erp",
                table: "product_lots",
                columns: new[] { "product_id", "number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_product_presentations_product_id_name",
                schema: "erp",
                table: "product_presentations",
                columns: new[] { "product_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_product_presentations_unit_of_measure_id",
                schema: "erp",
                table: "product_presentations",
                column: "unit_of_measure_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_prices_currency_id",
                schema: "erp",
                table: "product_prices",
                column: "currency_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_prices_presentation_id",
                schema: "erp",
                table: "product_prices",
                column: "presentation_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_prices_price_list_id",
                schema: "erp",
                table: "product_prices",
                column: "price_list_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_prices_product_id_presentation_id_price_list_id_cur~",
                schema: "erp",
                table: "product_prices",
                columns: new[] { "product_id", "presentation_id", "price_list_id", "currency_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "product_lots",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "product_prices",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "currencies",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "price_lists",
                schema: "erp");

            migrationBuilder.DropTable(
                name: "product_presentations",
                schema: "erp");

            migrationBuilder.DropColumn(
                name: "stock_max",
                schema: "erp",
                table: "products");

            migrationBuilder.DropColumn(
                name: "stock_min",
                schema: "erp",
                table: "products");

            migrationBuilder.DropColumn(
                name: "ticket_description",
                schema: "erp",
                table: "products");
        }
    }
}
