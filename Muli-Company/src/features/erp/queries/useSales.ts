import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as salesService from '../services/sales.service'

export const salesKeys = {
  customers: { all: ['erp', 'customers'] as const },
  salesPriceLists: { all: ['erp', 'sales-price-lists'] as const },
  commercialTerms: { all: ['erp', 'commercial-terms'] as const },
  salesCommissions: { all: ['erp', 'sales-commissions'] as const },
  quotations: { all: ['erp', 'quotations'] as const },
  salesOrders: { all: ['erp', 'sales-orders'] as const },
}

// ── Customers ──
export const useCustomers = () =>
  useQuery({ queryKey: salesKeys.customers.all, queryFn: salesService.getCustomers })

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: salesService.createCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.customers.all }),
  })
}

export function useUpdateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: salesService.CreateCustomerRequest }) =>
      salesService.updateCustomer(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.customers.all }),
  })
}

export function useSetCustomerStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      salesService.setCustomerStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.customers.all }),
  })
}

// ── Sales Price Lists ──
export const useSalesPriceLists = () =>
  useQuery({ queryKey: salesKeys.salesPriceLists.all, queryFn: salesService.getSalesPriceLists })

export function useCreateSalesPriceList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: salesService.createSalesPriceList,
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.salesPriceLists.all }),
  })
}

export function useUpdateSalesPriceList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: salesService.CreateSalesPriceListRequest }) =>
      salesService.updateSalesPriceList(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.salesPriceLists.all }),
  })
}

export function useSetSalesPriceListStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      salesService.setSalesPriceListStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.salesPriceLists.all }),
  })
}

// ── Commercial Terms ──
export const useCommercialTerms = () =>
  useQuery({ queryKey: salesKeys.commercialTerms.all, queryFn: salesService.getCommercialTerms })

export function useCreateCommercialTerm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: salesService.createCommercialTerm,
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.commercialTerms.all }),
  })
}

export function useUpdateCommercialTerm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: salesService.CreateCommercialTermRequest }) =>
      salesService.updateCommercialTerm(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.commercialTerms.all }),
  })
}

export function useSetCommercialTermStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      salesService.setCommercialTermStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.commercialTerms.all }),
  })
}

// ── Sales Commissions ──
export const useSalesCommissions = () =>
  useQuery({ queryKey: salesKeys.salesCommissions.all, queryFn: salesService.getSalesCommissions })

export function useCreateSalesCommission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: salesService.createSalesCommission,
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.salesCommissions.all }),
  })
}

export function useUpdateSalesCommission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: salesService.CreateSalesCommissionRequest }) =>
      salesService.updateSalesCommission(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.salesCommissions.all }),
  })
}

export function useSetSalesCommissionStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      salesService.setSalesCommissionStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.salesCommissions.all }),
  })
}

// ── Quotations ──
export const useQuotations = () =>
  useQuery({ queryKey: salesKeys.quotations.all, queryFn: salesService.getQuotations })

export function useCreateQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: salesService.createQuotation,
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.quotations.all }),
  })
}

export function useUpdateQuotationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      salesService.updateQuotationStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.quotations.all }),
  })
}

// ── Sales Orders ──
export const useSalesOrders = () =>
  useQuery({ queryKey: salesKeys.salesOrders.all, queryFn: salesService.getSalesOrders })

export function useCreateSalesOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: salesService.createSalesOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.salesOrders.all }),
  })
}

export function useUpdateSalesOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      salesService.updateSalesOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.salesOrders.all }),
  })
}
