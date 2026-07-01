export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    MY_PERMISSIONS: '/auth/me/permissions',
    CHANGE_PASSWORD: '/auth/me/change-password',
  },
  COMPANIES: '/companies',
  PERMISSIONS: '/permissions',
  LOOKUP: {
    ruc: (ruc: string) => `/lookup/ruc/${ruc}`,
    dni: (dni: string) => `/lookup/dni/${dni}`,
  },
  ERP: {
    // ── Inventory ──
    warehouses: '/erp/warehouses',
    warehouse: (id: string) => `/erp/warehouses/${id}`,
    warehouseStatus: (id: string) => `/erp/warehouses/${id}/status`,
    stockByWarehouse: (warehouseId: string) => `/erp/stock/warehouse/${warehouseId}`,
    stockMovement: '/erp/stock/movement',
    stockMovements: '/erp/stock/movements',
    transfers: '/erp/transfers',
    transfer: (id: string) => `/erp/transfers/${id}`,
    transferComplete: (id: string) => `/erp/transfers/${id}/complete`,
    transferCancel: (id: string) => `/erp/transfers/${id}/cancel`,
    kardexByProduct: (productId: string) => `/erp/kardex/product/${productId}`,

    stockValuation: '/erp/stock/valuation',
    stockLowReorder: '/erp/stock/low-reorder',
    stockLevels: (id: string) => `/erp/stock/${id}/levels`,
    stockReservations: '/erp/stock/reservations',
    stockReservationRelease: (id: string) => `/erp/stock/reservations/${id}/release`,
    locations: (warehouseId: string) => `/erp/warehouses/${warehouseId}/locations`,
    location: (warehouseId: string, id: string) => `/erp/warehouses/${warehouseId}/locations/${id}`,
    serialsByProduct: (productId: string) => `/erp/serials/product/${productId}`,
    serialsByWarehouse: (warehouseId: string) => `/erp/serials/warehouse/${warehouseId}`,
    serials: '/erp/serials',
    serialStatus: (id: string) => `/erp/serials/${id}/status`,
    physicalCounts: '/erp/stock/physical-counts',
    physicalCount: (id: string) => `/erp/stock/physical-counts/${id}`,
    physicalCountLines: (id: string) => `/erp/stock/physical-counts/${id}/lines`,
    physicalCountLineRecord: (lineId: string) => `/erp/stock/physical-counts/lines/${lineId}`,
    physicalCountComplete: (id: string) => `/erp/stock/physical-counts/${id}/complete`,
    physicalCountApprove: (id: string) => `/erp/stock/physical-counts/${id}/approve`,
    physicalCountCancel: (id: string) => `/erp/stock/physical-counts/${id}/cancel`,

    units: '/erp/units',
    unit: (id: string) => `/erp/units/${id}`,
    unitStatus: (id: string) => `/erp/units/${id}/status`,
    categories: '/erp/categories',
    category: (id: string) => `/erp/categories/${id}`,
    subcategories: '/erp/subcategories',
    subcategory: (id: string) => `/erp/subcategories/${id}`,
    subcategoryByCategory: (categoryId: string) => `/erp/subcategories/by-category/${categoryId}`,
    brands: '/erp/brands',
    brand: (id: string) => `/erp/brands/${id}`,
    subbrands: '/erp/subbrands',
    subbrand: (id: string) => `/erp/subbrands/${id}`,
    subbrandByBrand: (brandId: string) => `/erp/subbrands/by-brand/${brandId}`,
    products: '/erp/products',
    product: (id: string) => `/erp/products/${id}`,
    productStatus: (id: string) => `/erp/products/${id}/status`,
    productPresentations: (productId: string) => `/erp/products/${productId}/presentations`,
    productPresentation: (productId: string, id: string) => `/erp/products/${productId}/presentations/${id}`,
    productLots: (productId: string) => `/erp/products/${productId}/lots`,
    productLot: (productId: string, id: string) => `/erp/products/${productId}/lots/${id}`,
    productPrices: (productId: string) => `/erp/products/${productId}/prices`,
    priceLists: '/erp/price-lists',
    priceList: (id: string) => `/erp/price-lists/${id}`,
    priceListStatus: (id: string) => `/erp/price-lists/${id}/status`,
    currencies: '/erp/currencies',
    currency: (id: string) => `/erp/currencies/${id}`,
    currencyStatus: (id: string) => `/erp/currencies/${id}/status`,
  },
  company: (companyId: string) => `/companies/${companyId}`,
  companyModules: (companyId: string) => `/companies/${companyId}/modules`,
  companyAccess: (companyId: string) => `/companies/${companyId}/access`,
  companySystems: (companyId: string) => `/companies/${companyId}/systems`,
  companySystem: (companyId: string, systemId: string) =>
    `/companies/${companyId}/systems/${systemId}`,
  companyUsers: (companyId: string) => `/companies/${companyId}/users`,
  companyUser: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}`,
  companyUserRoles: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}/roles`,
  companyUserChangePassword: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}/change-password`,
  companyUserDeactivate: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}/deactivate`,
  companyUserReactivate: (companyId: string, userId: string) =>
    `/companies/${companyId}/users/${userId}/reactivate`,
  companyRoles: (companyId: string) => `/companies/${companyId}/roles`,
  companyRole: (companyId: string, roleId: string) =>
    `/companies/${companyId}/roles/${roleId}`,
  companyRolePermissions: (companyId: string, roleId: string) =>
    `/companies/${companyId}/roles/${roleId}/permissions`,
} as const

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
} as const

export const ENTITY_STATUS = {
  ACTIVE: 1,
  SUSPENDED: 2,
} as const

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  COMPANIES: '/iam/companies',
  COMPANY_DETAIL: '/iam/companies/$companyId',
  USERS: '/iam/users',
  USER_DETAIL: '/iam/users/$userId',
  ROLES: '/iam/roles',
  ROLE_DETAIL: '/iam/roles/$roleId',
  PERMISSIONS: '/iam/permissions',
  PROFILE: '/profile',
  ERP_PRODUCTS: '/erp/productos',
  ERP_INVENTORY: '/erp/inventario',
} as const

export const STORAGE_KEYS = {
  AUTH: 'integracloud.auth',
  REMEMBER_EMAIL: 'integracloud.remember_email',
  SIDEBAR: 'integracloud.sidebar',
} as const

export const APP_NAME = 'BRAVIC SYSTEMS'
