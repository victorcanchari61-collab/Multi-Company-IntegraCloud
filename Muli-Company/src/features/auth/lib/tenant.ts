// Resuelve el "slug" (subdominio) de la empresa para el login con branding.
//   prod:  empresa-x.tuapp.com  → "empresa-x"
//   dev:   localhost:5173/login?empresa=empresa-x  → "empresa-x"
// Devuelve null cuando es el login del dueño (apex, www, app o localhost sin override).

const RESERVED = new Set(['www', 'app', 'admin', 'api'])

export function getTenantSlug(): string | null {
  if (typeof window === 'undefined') return null

  // Override para desarrollo/testing.
  const override = new URLSearchParams(window.location.search).get('empresa')
  if (override) return override

  const host = window.location.hostname
  if (host === 'localhost' || /^\d+(\.\d+){3}$/.test(host)) return null

  const parts = host.split('.')
  // Necesita al menos sub.dominio.tld para considerar que hay subdominio.
  if (parts.length < 3) return null

  const sub = parts[0]
  return RESERVED.has(sub) ? null : sub
}
