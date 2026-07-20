// Consulta de RUC/DNI vía el backend propio (que oculta el token de apisperu).
// Reutilizable por cualquier formulario: const data = await lookupRuc('20...')
import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'

export interface RucInfo {
  ruc: string
  razonSocial: string
  nombreComercial: string | null
  direccion: string | null
  estado: string | null
  condicion: string | null
  departamento: string | null
  provincia: string | null
  distrito: string | null
}

export interface DniInfo {
  dni: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  nombreCompleto: string
}

export const lookupRuc = (ruc: string): Promise<RucInfo> =>
  api.get<RucInfo>(API_ENDPOINTS.LOOKUP.ruc(ruc))

export const lookupDni = (dni: string): Promise<DniInfo> =>
  api.get<DniInfo>(API_ENDPOINTS.LOOKUP.dni(dni))
