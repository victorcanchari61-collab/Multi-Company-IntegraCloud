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
  ERP_UNITS: '/erp/unidades',
  ERP_PRODUCTS: '/erp/productos',
  ERP_CATEGORIES: '/erp/categorias',
  ERP_SUBCATEGORIES: '/erp/subcategorias',
  ERP_BRANDS: '/erp/marcas',
  ERP_SUBBRANDS: '/erp/submarcas',
} as const

export const STORAGE_KEYS = {
  AUTH: 'integracloud.auth',
  REMEMBER_EMAIL: 'integracloud.remember_email',
  SIDEBAR: 'integracloud.sidebar',
} as const

export const APP_NAME = 'BRAVIC SYSTEMS'
