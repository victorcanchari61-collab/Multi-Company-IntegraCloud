export interface Company {
  id: string;
  name: string;
  slug: string;
  legalName: string | null;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  taxId: string | null;
  taxAddress: string | null;
  economicActivity: string | null;
  taxpayerType: number; // 1 = persona natural, 2 = persona jurídica
  accountingRequired: boolean;
  settlementCurrency: string;
  status: number; // ENTITY_STATUS.ACTIVE | ENTITY_STATUS.SUSPENDED
  createdAt: string;
}

export interface CreateCompanyRequest {
  name: string;
  slug: string;
  legalName?: string | null;
  logoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  taxId?: string | null;
  taxAddress?: string | null;
  economicActivity?: string | null;
  taxpayerType?: number;
  accountingRequired?: boolean;
  settlementCurrency?: string;
  solUser?: string | null;
  solPassword?: string | null;
  certificatePassword?: string | null;
  certificateFileName?: string | null;
  certificateContent?: string | null; // base64 sin el prefijo data:
  adminEmail?: string | null;
  adminFullName?: string | null;
  adminPassword?: string | null;
}

// Igual que CreateCompanyRequest pero sin los campos de administrador inicial
// (el admin solo se crea junto con la empresa, no se puede reasignar al editar).
export type UpdateCompanyRequest = Omit<CreateCompanyRequest, 'adminEmail' | 'adminFullName' | 'adminPassword'>;

export const TAXPAYER_TYPE = {
  PERSONA_NATURAL: 1,
  PERSONA_JURIDICA: 2,
} as const;
