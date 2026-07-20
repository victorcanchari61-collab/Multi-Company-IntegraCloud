import { api } from '@/lib/api'

export interface CustomerDto {
  id: string; code: string; businessName: string; tradeName: string | null
  taxId: string | null; address: string | null; phone: string | null
  email: string | null; contactPerson: string | null; creditLimit: number | null; isActive: boolean
}

export interface CreateCustomerRequest {
  code: string; businessName: string; tradeName?: string | null; taxId?: string | null
  address?: string | null; phone?: string | null; email?: string | null
  contactPerson?: string | null; creditLimit?: number | null
}

export interface SalesPriceListDto {
  id: string; code: string; name: string; currency: string | null
  isActive: boolean; items: SalesPriceListItemDto[]
}

export interface SalesPriceListItemDto {
  id: string; productId: string; productName: string; unitPrice: number
}

export interface CreateSalesPriceListRequest {
  code: string; name: string; currency?: string | null
  items: { productId: string; unitPrice: number }[]
}

export interface CommercialTermDto {
  id: string; code: string; name: string; description: string | null
  paymentDays: number; isActive: boolean
}

export interface CreateCommercialTermRequest {
  code: string; name: string; description?: string | null; paymentDays: number
}

export interface SalesCommissionDto {
  id: string; code: string; name: string; salesAgentName: string | null
  commissionRate: number; isActive: boolean
}

export interface CreateSalesCommissionRequest {
  code: string; name: string; salesAgentName?: string | null; commissionRate: number
}

export interface QuotationItemDto {
  id: string; productId: string; productName: string; quantity: number; unitPrice: number; subTotal: number
}

export interface QuotationDto {
  id: string; customerId: string; customerName: string; quotationNumber: string
  issueDate: string; validUntil: string | null; status: string
  subTotal: number; tax: number; total: number; notes: string | null
  items: QuotationItemDto[]
}

export interface CreateQuotationRequest {
  customerId: string; validUntil?: string | null; notes?: string | null
  items: { productId: string; quantity: number; unitPrice: number }[]
}

export interface SalesOrderItemDto {
  id: string; productId: string; productName: string; quantity: number; unitPrice: number; subTotal: number
}

export interface SalesOrderDto {
  id: string; customerId: string; customerName: string; orderNumber: string
  issueDate: string; deliveryDate: string | null; status: string
  subTotal: number; tax: number; total: number; notes: string | null
  items: SalesOrderItemDto[]
}

export interface CreateSalesOrderRequest {
  customerId: string; deliveryDate?: string | null; notes?: string | null
  items: { productId: string; quantity: number; unitPrice: number }[]
}

// ── Customers ──
export const getCustomers = (): Promise<CustomerDto[]> =>
  api.get<CustomerDto[]>('/erp/customers')

export const createCustomer = (data: CreateCustomerRequest): Promise<string> =>
  api.post<string>('/erp/customers', data)

export const updateCustomer = (id: string, data: CreateCustomerRequest): Promise<void> =>
  api.put<void>(`/erp/customers/${id}`, data)

export const setCustomerStatus = (id: string, isActive: boolean): Promise<void> =>
  api.post<void>(`/erp/customers/${id}/status`, { isActive })

// ── Sales Price Lists ──
export const getSalesPriceLists = (): Promise<SalesPriceListDto[]> =>
  api.get<SalesPriceListDto[]>('/erp/sales-price-lists')

export const createSalesPriceList = (data: CreateSalesPriceListRequest): Promise<string> =>
  api.post<string>('/erp/sales-price-lists', data)

export const updateSalesPriceList = (id: string, data: CreateSalesPriceListRequest): Promise<void> =>
  api.put<void>(`/erp/sales-price-lists/${id}`, data)

export const setSalesPriceListStatus = (id: string, isActive: boolean): Promise<void> =>
  api.post<void>(`/erp/sales-price-lists/${id}/status`, { isActive })

// ── Commercial Terms ──
export const getCommercialTerms = (): Promise<CommercialTermDto[]> =>
  api.get<CommercialTermDto[]>('/erp/commercial-terms')

export const createCommercialTerm = (data: CreateCommercialTermRequest): Promise<string> =>
  api.post<string>('/erp/commercial-terms', data)

export const updateCommercialTerm = (id: string, data: CreateCommercialTermRequest): Promise<void> =>
  api.put<void>(`/erp/commercial-terms/${id}`, data)

export const setCommercialTermStatus = (id: string, isActive: boolean): Promise<void> =>
  api.post<void>(`/erp/commercial-terms/${id}/status`, { isActive })

// ── Sales Commissions ──
export const getSalesCommissions = (): Promise<SalesCommissionDto[]> =>
  api.get<SalesCommissionDto[]>('/erp/sales-commissions')

export const createSalesCommission = (data: CreateSalesCommissionRequest): Promise<string> =>
  api.post<string>('/erp/sales-commissions', data)

export const updateSalesCommission = (id: string, data: CreateSalesCommissionRequest): Promise<void> =>
  api.put<void>(`/erp/sales-commissions/${id}`, data)

export const setSalesCommissionStatus = (id: string, isActive: boolean): Promise<void> =>
  api.post<void>(`/erp/sales-commissions/${id}/status`, { isActive })

// ── Quotations ──
export const getQuotations = (): Promise<QuotationDto[]> =>
  api.get<QuotationDto[]>('/erp/quotations')

export const createQuotation = (data: CreateQuotationRequest): Promise<string> =>
  api.post<string>('/erp/quotations', data)

export const updateQuotationStatus = (id: string, status: string): Promise<void> =>
  api.post<void>(`/erp/quotations/${id}/status`, { status })

// ── Sales Orders ──
export const getSalesOrders = (): Promise<SalesOrderDto[]> =>
  api.get<SalesOrderDto[]>('/erp/sales-orders')

export const createSalesOrder = (data: CreateSalesOrderRequest): Promise<string> =>
  api.post<string>('/erp/sales-orders', data)

export const updateSalesOrderStatus = (id: string, status: string): Promise<void> =>
  api.post<void>(`/erp/sales-orders/${id}/status`, { status })
