import { api } from '@/lib/api'

export interface CompanyBranding {
  slug: string
  name: string
  logoUrl: string | null
}

/** Branding público de una empresa por subdominio (endpoint sin auth). */
export const getCompanyBranding = (slug: string): Promise<CompanyBranding> =>
  api.get<CompanyBranding>(`/companies/branding/${slug}`)
