// Tipos del feature de autenticación. Espejan los DTOs del backend (IAM).

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: string // ISO date
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  companyId: string | null
  isOwner: boolean
  roles: string[]
}

export interface LoginRequest {
  email: string
  password: string
  slug?: string | null
}
