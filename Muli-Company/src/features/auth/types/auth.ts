export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  companyId: string | null
  isOwner: boolean
  roles: string[]
  allRestrictions: string[]
  rolSistema?: string | null
  authGrants?: string[]
  roleName?: string | null
}

export interface LoginRequest {
  email: string
  password: string
  slug?: string | null
}
