CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE TABLE actions (
    code character varying(30) NOT NULL,
    name character varying(60) NOT NULL,
    "Id" uuid NOT NULL,
    CONSTRAINT "PK_actions" PRIMARY KEY (code)
);

CREATE TABLE companies (
    "Id" uuid NOT NULL,
    name character varying(150) NOT NULL,
    slug character varying(80) NOT NULL,
    legal_name character varying(200),
    logo_url character varying(500),
    email character varying(150),
    phone character varying(20),
    website character varying(255),
    address character varying(300),
    tax_id character varying(20),
    tax_address character varying(300),
    economic_activity character varying(255),
    taxpayer_type integer NOT NULL DEFAULT 1,
    accounting_required boolean NOT NULL DEFAULT FALSE,
    settlement_currency character varying(3) NOT NULL DEFAULT 'PEN',
    status integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone NOT NULL,
    created_by uuid,
    CONSTRAINT "PK_companies" PRIMARY KEY ("Id")
);

CREATE TABLE systems (
    "Id" uuid NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    is_active boolean NOT NULL DEFAULT TRUE,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT "PK_systems" PRIMARY KEY ("Id")
);

CREATE TABLE roles (
    "Id" uuid NOT NULL,
    company_id uuid NOT NULL,
    name character varying(80) NOT NULL,
    description character varying(255),
    is_system_template boolean NOT NULL DEFAULT FALSE,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT "PK_roles" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_roles_companies_company_id" FOREIGN KEY (company_id) REFERENCES companies ("Id") ON DELETE CASCADE
);

CREATE TABLE users (
    "Id" uuid NOT NULL,
    company_id uuid,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(150) NOT NULL,
    status integer NOT NULL DEFAULT 1,
    is_owner boolean NOT NULL DEFAULT FALSE,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT "PK_users" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_users_companies_company_id" FOREIGN KEY (company_id) REFERENCES companies ("Id") ON DELETE RESTRICT
);

CREATE TABLE modules (
    "Id" uuid NOT NULL,
    system_id uuid NOT NULL,
    code character varying(40) NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean NOT NULL DEFAULT TRUE,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT "PK_modules" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_modules_systems_system_id" FOREIGN KEY (system_id) REFERENCES systems ("Id") ON DELETE RESTRICT
);

CREATE TABLE refresh_tokens (
    "Id" uuid NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_refresh_tokens_users_user_id" FOREIGN KEY (user_id) REFERENCES users ("Id") ON DELETE CASCADE
);

CREATE TABLE user_roles (
    "Id" uuid NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    CONSTRAINT "PK_user_roles" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_user_roles_roles_role_id" FOREIGN KEY (role_id) REFERENCES roles ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_user_roles_users_user_id" FOREIGN KEY (user_id) REFERENCES users ("Id") ON DELETE CASCADE
);

CREATE TABLE company_module_access (
    "Id" uuid NOT NULL,
    company_id uuid NOT NULL,
    module_id uuid NOT NULL,
    granted_at timestamp with time zone NOT NULL,
    granted_by uuid,
    CONSTRAINT "PK_company_module_access" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_company_module_access_companies_company_id" FOREIGN KEY (company_id) REFERENCES companies ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_company_module_access_modules_module_id" FOREIGN KEY (module_id) REFERENCES modules ("Id") ON DELETE RESTRICT
);

CREATE TABLE permissions (
    "Id" uuid NOT NULL,
    key character varying(160) NOT NULL,
    resource_type integer NOT NULL,
    resource_id uuid NOT NULL,
    module_id uuid NOT NULL,
    action_code character varying(30) NOT NULL,
    description character varying(255),
    CONSTRAINT "PK_permissions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_permissions_actions_action_code" FOREIGN KEY (action_code) REFERENCES actions (code) ON DELETE RESTRICT,
    CONSTRAINT "FK_permissions_modules_module_id" FOREIGN KEY (module_id) REFERENCES modules ("Id") ON DELETE RESTRICT
);

CREATE TABLE views (
    "Id" uuid NOT NULL,
    module_id uuid NOT NULL,
    code character varying(60) NOT NULL,
    name character varying(100) NOT NULL,
    route character varying(150),
    CONSTRAINT "PK_views" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_views_modules_module_id" FOREIGN KEY (module_id) REFERENCES modules ("Id") ON DELETE RESTRICT
);

CREATE TABLE role_permissions (
    "Id" uuid NOT NULL,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    CONSTRAINT "PK_role_permissions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_role_permissions_permissions_permission_id" FOREIGN KEY (permission_id) REFERENCES permissions ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_role_permissions_roles_role_id" FOREIGN KEY (role_id) REFERENCES roles ("Id") ON DELETE CASCADE
);

CREATE TABLE components (
    "Id" uuid NOT NULL,
    view_id uuid NOT NULL,
    code character varying(60) NOT NULL,
    name character varying(100) NOT NULL,
    CONSTRAINT "PK_components" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_components_views_view_id" FOREIGN KEY (view_id) REFERENCES views ("Id") ON DELETE RESTRICT
);

CREATE UNIQUE INDEX "IX_companies_slug" ON companies (slug);

CREATE UNIQUE INDEX "IX_companies_tax_id" ON companies (tax_id);

CREATE INDEX "IX_company_module_access_company_id" ON company_module_access (company_id);

CREATE UNIQUE INDEX "IX_company_module_access_company_id_module_id" ON company_module_access (company_id, module_id);

CREATE INDEX "IX_company_module_access_module_id" ON company_module_access (module_id);

CREATE INDEX "IX_components_view_id" ON components (view_id);

CREATE UNIQUE INDEX "IX_components_view_id_code" ON components (view_id, code);

CREATE INDEX "IX_modules_system_id" ON modules (system_id);

CREATE UNIQUE INDEX "IX_modules_system_id_code" ON modules (system_id, code);

CREATE INDEX "IX_permissions_action_code" ON permissions (action_code);

CREATE UNIQUE INDEX "IX_permissions_key" ON permissions (key);

CREATE INDEX "IX_permissions_module_id" ON permissions (module_id);

CREATE UNIQUE INDEX "IX_permissions_resource_type_resource_id_action_code" ON permissions (resource_type, resource_id, action_code);

CREATE INDEX "IX_refresh_tokens_user_id" ON refresh_tokens (user_id);

CREATE INDEX "IX_role_permissions_permission_id" ON role_permissions (permission_id);

CREATE UNIQUE INDEX "IX_role_permissions_role_id_permission_id" ON role_permissions (role_id, permission_id);

CREATE INDEX "IX_roles_company_id" ON roles (company_id);

CREATE UNIQUE INDEX "IX_roles_company_id_name" ON roles (company_id, name);

CREATE UNIQUE INDEX "IX_systems_code" ON systems (code);

CREATE INDEX "IX_user_roles_role_id" ON user_roles (role_id);

CREATE UNIQUE INDEX "IX_user_roles_user_id_role_id" ON user_roles (user_id, role_id);

CREATE INDEX "IX_users_company_id" ON users (company_id);

CREATE UNIQUE INDEX "IX_users_company_id_email" ON users (company_id, email);

CREATE INDEX "IX_views_module_id" ON views (module_id);

CREATE UNIQUE INDEX "IX_views_module_id_code" ON views (module_id, code);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260623021357_InitialCreate', '10.0.9');

COMMIT;

