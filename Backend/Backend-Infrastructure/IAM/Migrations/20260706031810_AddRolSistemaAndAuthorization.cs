using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Infrastructure.IAM.Migrations
{
    /// <inheritdoc />
    public partial class AddRolSistemaAndAuthorization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_company_id",
                schema: "iam",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_roles_company_id",
                schema: "iam",
                table: "roles");

            migrationBuilder.AddColumn<string>(
                name: "rol_sistema",
                schema: "iam",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "rol_sistema",
                schema: "iam",
                table: "roles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "authorization_configs",
                schema: "iam",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    module = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    action = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    tipo_autorizador = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "usuario"),
                    autorizador_id = table.Column<Guid>(type: "uuid", nullable: true),
                    cargo_autorizador = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    role_autorizador_id = table.Column<Guid>(type: "uuid", nullable: true),
                    requiere_autorizacion = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_authorization_configs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_authorization_configs_roles_role_id",
                        column: x => x.role_id,
                        principalSchema: "iam",
                        principalTable: "roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "authorization_grants",
                schema: "iam",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    module = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    action = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    tipo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "permanente"),
                    activa = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_authorization_grants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_authorization_grants_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "iam",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "authorization_requests",
                schema: "iam",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    module = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    action = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    estado = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "pendiente"),
                    autorizador_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_authorization_requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_authorization_requests_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "iam",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_authorization_configs_role_id_module_action",
                schema: "iam",
                table: "authorization_configs",
                columns: new[] { "role_id", "module", "action" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_authorization_grants_user_id_module_action_activa",
                schema: "iam",
                table: "authorization_grants",
                columns: new[] { "user_id", "module", "action", "activa" });

            migrationBuilder.CreateIndex(
                name: "IX_authorization_requests_user_id",
                schema: "iam",
                table: "authorization_requests",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "authorization_configs",
                schema: "iam");

            migrationBuilder.DropTable(
                name: "authorization_grants",
                schema: "iam");

            migrationBuilder.DropTable(
                name: "authorization_requests",
                schema: "iam");

            migrationBuilder.DropColumn(
                name: "rol_sistema",
                schema: "iam",
                table: "users");

            migrationBuilder.DropColumn(
                name: "rol_sistema",
                schema: "iam",
                table: "roles");

            migrationBuilder.CreateIndex(
                name: "IX_users_company_id",
                schema: "iam",
                table: "users",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_roles_company_id",
                schema: "iam",
                table: "roles",
                column: "company_id");
        }
    }
}
