import { buildPermissionKey, PERMISSION_GROUP, PERMISSION_ACTION } from '@/lib/permissions';

export interface RoutePermissionEntry {
  permissionKey?: string;
  /** If true, any of the listed permissionKeys grants access */
  anyOf?: string[];
  /** If true, all of the listed permissionKeys are required */
  allOf?: string[];
  /** If true, this route is public (no auth check) */
  isPublic?: boolean;
}

/**
 * Mapea rutas del frontend a permisos requeridos.
 * Usado por AccesoGuard y el sidebar para ocultar/mostrar entradas.
 */
export const ROUTE_PERMISSION_MAP: Record<string, RoutePermissionEntry> = {
  // ── Dashboard ──
  '/dashboard': {},

  // ── IAM ──
  '/iam/users': { permissionKey: buildPermissionKey(PERMISSION_GROUP.USERS, PERMISSION_ACTION.VIEW) },
  '/iam/users/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.USERS, PERMISSION_ACTION.CREATE) },
  '/iam/users/:id': { permissionKey: buildPermissionKey(PERMISSION_GROUP.USERS, PERMISSION_ACTION.VIEW) },
  '/iam/users/:id/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.USERS, PERMISSION_ACTION.EDIT) },
  '/iam/roles': { permissionKey: buildPermissionKey(PERMISSION_GROUP.ROLES, PERMISSION_ACTION.VIEW) },
  '/iam/roles/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.ROLES, PERMISSION_ACTION.CREATE) },
  '/iam/roles/:id': { permissionKey: buildPermissionKey(PERMISSION_GROUP.ROLES, PERMISSION_ACTION.VIEW) },
  '/iam/roles/:id/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.ROLES, PERMISSION_ACTION.EDIT) },
  '/iam/permissions': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PERMISSIONS, PERMISSION_ACTION.VIEW) },

  // ── ERP: Catálogo ──
  '/erp/catalog': { permissionKey: buildPermissionKey(PERMISSION_GROUP.CATALOG, PERMISSION_ACTION.VIEW) },
  '/erp/products': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PRODUCTS, PERMISSION_ACTION.VIEW) },
  '/erp/products/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PRODUCTS, PERMISSION_ACTION.CREATE) },
  '/erp/products/:id': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PRODUCTS, PERMISSION_ACTION.VIEW) },
  '/erp/products/:id/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PRODUCTS, PERMISSION_ACTION.EDIT) },
  '/erp/price-lists': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PRICE_LISTS, PERMISSION_ACTION.VIEW) },
  '/erp/customers': { permissionKey: buildPermissionKey(PERMISSION_GROUP.CUSTOMERS, PERMISSION_ACTION.VIEW) },
  '/erp/customers/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.CUSTOMERS, PERMISSION_ACTION.CREATE) },
  '/erp/customers/:id': { permissionKey: buildPermissionKey(PERMISSION_GROUP.CUSTOMERS, PERMISSION_ACTION.VIEW) },
  '/erp/customers/:id/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.CUSTOMERS, PERMISSION_ACTION.EDIT) },
  '/erp/suppliers': { permissionKey: buildPermissionKey(PERMISSION_GROUP.SUPPLIERS, PERMISSION_ACTION.VIEW) },
  '/erp/suppliers/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.SUPPLIERS, PERMISSION_ACTION.CREATE) },
  '/erp/suppliers/:id': { permissionKey: buildPermissionKey(PERMISSION_GROUP.SUPPLIERS, PERMISSION_ACTION.VIEW) },
  '/erp/suppliers/:id/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.SUPPLIERS, PERMISSION_ACTION.EDIT) },

  // ── ERP: Compras ──
  '/erp/purchase-requests': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PURCHASE_REQUESTS, PERMISSION_ACTION.VIEW) },
  '/erp/purchase-requests/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PURCHASE_REQUESTS, PERMISSION_ACTION.CREATE) },
  '/erp/purchase-requests/:id': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PURCHASE_REQUESTS, PERMISSION_ACTION.VIEW) },
  '/erp/purchase-requests/:id/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PURCHASE_REQUESTS, PERMISSION_ACTION.EDIT) },
  '/erp/purchase-orders': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PURCHASE_ORDERS, PERMISSION_ACTION.VIEW) },
  '/erp/purchase-orders/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PURCHASE_ORDERS, PERMISSION_ACTION.CREATE) },
  '/erp/purchase-orders/:id': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PURCHASE_ORDERS, PERMISSION_ACTION.VIEW) },
  '/erp/purchase-orders/:id/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PURCHASE_ORDERS, PERMISSION_ACTION.EDIT) },

  // ── ERP: Ventas ──
  '/erp/quotations': { permissionKey: buildPermissionKey(PERMISSION_GROUP.QUOTATIONS, PERMISSION_ACTION.VIEW) },
  '/erp/quotations/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.QUOTATIONS, PERMISSION_ACTION.CREATE) },
  '/erp/quotations/:id': { permissionKey: buildPermissionKey(PERMISSION_GROUP.QUOTATIONS, PERMISSION_ACTION.VIEW) },
  '/erp/quotations/:id/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.QUOTATIONS, PERMISSION_ACTION.EDIT) },
  '/erp/sales-orders': { permissionKey: buildPermissionKey(PERMISSION_GROUP.SALES_ORDERS, PERMISSION_ACTION.VIEW) },
  '/erp/sales-orders/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.SALES_ORDERS, PERMISSION_ACTION.CREATE) },
  '/erp/sales-orders/:id': { permissionKey: buildPermissionKey(PERMISSION_GROUP.SALES_ORDERS, PERMISSION_ACTION.VIEW) },
  '/erp/sales-orders/:id/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.SALES_ORDERS, PERMISSION_ACTION.EDIT) },

  // ── ERP: Inventario ──
  '/erp/inventory': { permissionKey: buildPermissionKey(PERMISSION_GROUP.INVENTORY, PERMISSION_ACTION.VIEW) },
  '/erp/warehouses': { permissionKey: buildPermissionKey(PERMISSION_GROUP.WAREHOUSES, PERMISSION_ACTION.VIEW) },
  '/erp/warehouses/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.WAREHOUSES, PERMISSION_ACTION.CREATE) },
  '/erp/warehouses/:id': { permissionKey: buildPermissionKey(PERMISSION_GROUP.WAREHOUSES, PERMISSION_ACTION.VIEW) },
  '/erp/warehouses/:id/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.WAREHOUSES, PERMISSION_ACTION.EDIT) },
  '/erp/transfers': { permissionKey: buildPermissionKey(PERMISSION_GROUP.TRANSFERS, PERMISSION_ACTION.VIEW) },
  '/erp/transfers/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.TRANSFERS, PERMISSION_ACTION.CREATE) },
  '/erp/transfers/:id': { permissionKey: buildPermissionKey(PERMISSION_GROUP.TRANSFERS, PERMISSION_ACTION.VIEW) },
  '/erp/transfers/:id/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.TRANSFERS, PERMISSION_ACTION.EDIT) },
  '/erp/physical-counts': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PHYSICAL_COUNTS, PERMISSION_ACTION.VIEW) },
  '/erp/physical-counts/new': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PHYSICAL_COUNTS, PERMISSION_ACTION.CREATE) },

  // ── WMS ──
  '/wms': { permissionKey: buildPermissionKey(PERMISSION_GROUP.WMS, PERMISSION_ACTION.VIEW) },
  '/wms/packing': { permissionKey: buildPermissionKey(PERMISSION_GROUP.WMS, PERMISSION_ACTION.VIEW) },
  '/wms/shipping': { permissionKey: buildPermissionKey(PERMISSION_GROUP.WMS, PERMISSION_ACTION.VIEW) },
  '/wms/receiving': { permissionKey: buildPermissionKey(PERMISSION_GROUP.WMS, PERMISSION_ACTION.VIEW) },

  // ── POS ──
  '/pos': { anyOf: ['pos.open', 'pos.view'] },
  '/pos/close': { permissionKey: 'pos.close' },

  // ── Configuración ──
  '/config': { permissionKey: buildPermissionKey(PERMISSION_GROUP.COMPANY_CONFIG, PERMISSION_ACTION.VIEW) },
  '/config/company': { permissionKey: buildPermissionKey(PERMISSION_GROUP.COMPANY_CONFIG, PERMISSION_ACTION.VIEW) },
  '/config/company/edit': { permissionKey: buildPermissionKey(PERMISSION_GROUP.COMPANY_CONFIG, PERMISSION_ACTION.EDIT) },
  '/config/taxes': { permissionKey: buildPermissionKey(PERMISSION_GROUP.TAXES, PERMISSION_ACTION.VIEW) },
  '/config/permissions': { permissionKey: buildPermissionKey(PERMISSION_GROUP.PERMISSIONS, PERMISSION_ACTION.VIEW) },
};

export function getRoutePermission(path: string): RoutePermissionEntry | undefined {
  // Exact match first
  if (ROUTE_PERMISSION_MAP[path]) return ROUTE_PERMISSION_MAP[path];

  // Dynamic segment match: /erp/products/123 -> /erp/products/:id
  const segments = path.split('/').filter(Boolean);
  for (const [pattern, entry] of Object.entries(ROUTE_PERMISSION_MAP)) {
    const patternSegments = pattern.split('/').filter(Boolean);
    if (segments.length !== patternSegments.length) continue;

    const match = segments.every((seg, i) =>
      patternSegments[i].startsWith(':') || patternSegments[i] === seg
    );
    if (match) return entry;
  }

  return undefined;
}
