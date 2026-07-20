import { api } from '@/lib/api'

export interface SupplierDto {
  id: string; code: string; businessName: string; tradeName: string | null
  address: string | null; phone: string | null; email: string | null
  contactPerson: string | null; paymentTerms: string | null; creditLimit: number | null; isActive: boolean
}

export interface CreateSupplierRequest {
  code: string; businessName: string; tradeName?: string | null; address?: string | null
  phone?: string | null; email?: string | null; contactPerson?: string | null
  paymentTerms?: string | null; creditLimit?: number | null
}

export interface PurchaseOrderItemDto {
  id: string; productId: string; productName: string; quantity: number; unitPrice: number; subTotal: number; quantityReceived?: number
}

export interface PurchaseOrderDto {
  id: string; supplierId: string; supplierName: string; orderNumber: string
  issueDate: string; expectedDate: string | null; status: string
  subTotal: number; tax: number; total: number; notes: string | null
  items: PurchaseOrderItemDto[]
}

export interface CreatePurchaseOrderRequest {
  supplierId: string; expectedDate?: string | null; notes?: string | null
  items: { productId: string; quantity: number; unitPrice: number }[]
}

export interface PurchaseRequestItemDto {
  id: string; productId: string; productName: string; quantity: number
  description: string | null; estimatedPrice: number | null
}

export interface PurchaseRequestDto {
  id: string; requestNumber: string; requesterName: string; department: string | null
  requestDate: string; expectedDate: string | null; supplierId: string | null; supplierName: string | null
  priority: string | null; status: string; notes: string | null
  items: PurchaseRequestItemDto[]
}

export interface CreatePurchaseRequestRequest {
  requesterName: string; department?: string | null; expectedDate?: string | null; notes?: string | null
  supplierId?: string | null; priority?: string | null
  items: { productId: string; quantity: number; description?: string | null; estimatedPrice?: number | null }[]
}

export interface SupplierEvaluationDto {
  id: string; supplierId: string; supplierName: string
  evaluationDate: string; score: number; evaluatedBy: string
  priceRating: number | null; qualityRating: number | null
  deliveryRating: number | null; serviceRating: number | null; comments: string | null
  orderId?: string | null
}

export interface CreateSupplierEvaluationRequest {
  supplierId: string; evaluationDate: string; score: number; evaluatedBy: string
  priceRating?: number | null; qualityRating?: number | null
  deliveryRating?: number | null; serviceRating?: number | null; comments?: string | null
  orderId?: string | null
}

export interface PurchaseContractDto {
  id: string; supplierId: string; supplierName: string
  contractNumber: string; title: string
  startDate: string; endDate: string
  value: number | null; terms: string | null; isActive: boolean
}

export interface CreatePurchaseContractRequest {
  supplierId: string; contractNumber: string; title: string
  startDate: string; endDate: string; value?: number | null; terms?: string | null
}

// ── Suppliers ──
export const getSuppliers = (): Promise<SupplierDto[]> =>
  api.get<SupplierDto[]>('/erp/suppliers')

export const getSupplierById = (id: string): Promise<SupplierDto> =>
  api.get<SupplierDto>(`/erp/suppliers/${id}`)

export const createSupplier = (data: CreateSupplierRequest): Promise<string> =>
  api.post<string>('/erp/suppliers', data)

export const updateSupplier = (id: string, data: CreateSupplierRequest): Promise<void> =>
  api.put<void>(`/erp/suppliers/${id}`, data)

export const setSupplierStatus = (id: string, isActive: boolean): Promise<void> =>
  api.post<void>(`/erp/suppliers/${id}/status`, { isActive })

// ── Purchase Orders ──
export const getPurchaseOrders = (): Promise<PurchaseOrderDto[]> =>
  api.get<PurchaseOrderDto[]>('/erp/purchase-orders')

export const getPurchaseOrderById = (id: string): Promise<PurchaseOrderDto> =>
  api.get<PurchaseOrderDto>(`/erp/purchase-orders/${id}`)

export const createPurchaseOrder = (data: CreatePurchaseOrderRequest): Promise<string> =>
  api.post<string>('/erp/purchase-orders', data)

export const updatePurchaseOrder = (id: string, data: CreatePurchaseOrderRequest): Promise<void> =>
  api.put<void>(`/erp/purchase-orders/${id}`, data)

export const updatePurchaseOrderStatus = (id: string, status: string): Promise<void> =>
  api.post<void>(`/erp/purchase-orders/${id}/status`, { status })

export const receivePurchaseOrder = (id: string, items: { productId: string; quantity: number }[]): Promise<void> =>
  api.post<void>(`/erp/purchase-orders/${id}/receive`, { items })

// ── Purchase Requests ──
export const getPurchaseRequests = (): Promise<PurchaseRequestDto[]> =>
  api.get<PurchaseRequestDto[]>('/erp/purchase-requests')

export const createPurchaseRequest = (data: CreatePurchaseRequestRequest): Promise<string> =>
  api.post<string>('/erp/purchase-requests', data)

export const getPurchaseRequestById = (id: string): Promise<PurchaseRequestDto> =>
  api.get<PurchaseRequestDto>(`/erp/purchase-requests/${id}`)

export const updatePurchaseRequest = (id: string, data: CreatePurchaseRequestRequest): Promise<void> =>
  api.put<void>(`/erp/purchase-requests/${id}`, data)

export const updatePurchaseRequestStatus = (id: string, status: string): Promise<void> =>
  api.post<void>(`/erp/purchase-requests/${id}/status`, { status })

// ── Supplier Evaluations ──
export const getSupplierEvaluations = (supplierId?: string): Promise<SupplierEvaluationDto[]> => {
  const url = supplierId ? `/erp/supplier-evaluations?supplierId=${supplierId}` : '/erp/supplier-evaluations'
  return api.get<SupplierEvaluationDto[]>(url)
}

export const createSupplierEvaluation = (data: CreateSupplierEvaluationRequest): Promise<string> =>
  api.post<string>('/erp/supplier-evaluations', data)

export const getSupplierEvaluationById = (id: string): Promise<SupplierEvaluationDto> =>
  api.get<SupplierEvaluationDto>(`/erp/supplier-evaluations/${id}`)

export const updateSupplierEvaluation = (id: string, data: CreateSupplierEvaluationRequest): Promise<void> =>
  api.put<void>(`/erp/supplier-evaluations/${id}`, data)

export const deleteSupplierEvaluation = (id: string): Promise<void> =>
  api.delete<void>(`/erp/supplier-evaluations/${id}`)

// ── Purchase Contracts ──
export const getPurchaseContractById = (id: string): Promise<PurchaseContractDto> =>
  api.get<PurchaseContractDto>(`/erp/purchase-contracts/${id}`)

export const getPurchaseContracts = (supplierId?: string): Promise<PurchaseContractDto[]> => {
  const url = supplierId ? `/erp/purchase-contracts?supplierId=${supplierId}` : '/erp/purchase-contracts'
  return api.get<PurchaseContractDto[]>(url)
}

export const createPurchaseContract = (data: CreatePurchaseContractRequest): Promise<string> =>
  api.post<string>('/erp/purchase-contracts', data)

export const updatePurchaseContract = (id: string, data: CreatePurchaseContractRequest): Promise<void> =>
  api.put<void>(`/erp/purchase-contracts/${id}`, data)

export const setPurchaseContractStatus = (id: string, isActive: boolean): Promise<void> =>
  api.post<void>(`/erp/purchase-contracts/${id}/status`, { isActive })
