import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as purchasesService from '../services/purchases.service'

export const purchasesKeys = {
  suppliers: { all: ['erp', 'suppliers'] as const },
  supplier: (id: string) => ['erp', 'suppliers', id] as const,
  purchaseOrders: { all: ['erp', 'purchase-orders'] as const },
  purchaseOrder: (id: string) => ['erp', 'purchase-orders', id] as const,
  purchaseRequests: { all: ['erp', 'purchase-requests'] as const },
  purchaseRequest: (id: string) => ['erp', 'purchase-requests', id] as const,
  supplierEvaluations: (supplierId?: string) =>
    ['erp', 'supplier-evaluations', supplierId] as const,
  supplierEvaluation: (id: string) => ['erp', 'supplier-evaluations', id] as const,
  purchaseContracts: (supplierId?: string) =>
    ['erp', 'purchase-contracts', supplierId] as const,
  purchaseContract: (id: string) => ['erp', 'purchase-contracts', id] as const,
}

// ── Suppliers ──
export const useSuppliers = () =>
  useQuery({ queryKey: purchasesKeys.suppliers.all, queryFn: purchasesService.getSuppliers })

export const useSupplierById = (id: string) =>
  useQuery({
    queryKey: purchasesKeys.supplier(id),
    queryFn: () => purchasesService.getSupplierById(id),
    enabled: !!id,
  })

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: purchasesService.createSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.suppliers.all }),
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: purchasesService.CreateSupplierRequest }) =>
      purchasesService.updateSupplier(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.suppliers.all }),
  })
}

export function useSetSupplierStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      purchasesService.setSupplierStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.suppliers.all }),
  })
}

// ── Purchase Orders ──
export const usePurchaseOrders = () =>
  useQuery({ queryKey: purchasesKeys.purchaseOrders.all, queryFn: purchasesService.getPurchaseOrders })

export const usePurchaseOrderById = (id: string) =>
  useQuery({
    queryKey: purchasesKeys.purchaseOrder(id),
    queryFn: () => purchasesService.getPurchaseOrderById(id),
    enabled: !!id,
  })

export function useCreatePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: purchasesService.createPurchaseOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.purchaseOrders.all }),
  })
}

export function useUpdatePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: purchasesService.CreatePurchaseOrderRequest }) =>
      purchasesService.updatePurchaseOrder(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.purchaseOrders.all }),
  })
}

export function useUpdatePurchaseOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      purchasesService.updatePurchaseOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.purchaseOrders.all }),
  })
}

export function useReceivePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: { productId: string; quantity: number }[] }) =>
      purchasesService.receivePurchaseOrder(id, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.purchaseOrders.all }),
  })
}

// ── Purchase Requests ──
export const usePurchaseRequests = () =>
  useQuery({ queryKey: purchasesKeys.purchaseRequests.all, queryFn: purchasesService.getPurchaseRequests })

export const usePurchaseRequestById = (id: string) =>
  useQuery({
    queryKey: purchasesKeys.purchaseRequest(id),
    queryFn: () => purchasesService.getPurchaseRequestById(id),
    enabled: !!id,
  })

export function useCreatePurchaseRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: purchasesService.createPurchaseRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.purchaseRequests.all }),
  })
}

export function useUpdatePurchaseRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: purchasesService.CreatePurchaseRequestRequest }) =>
      purchasesService.updatePurchaseRequest(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.purchaseRequests.all }),
  })
}

export function useUpdatePurchaseRequestStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      purchasesService.updatePurchaseRequestStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.purchaseRequests.all }),
  })
}

// ── Supplier Evaluations ──
export const useSupplierEvaluations = (supplierId?: string) =>
  useQuery({
    queryKey: purchasesKeys.supplierEvaluations(supplierId),
    queryFn: () => purchasesService.getSupplierEvaluations(supplierId),
  })

export const useSupplierEvaluationById = (id: string) =>
  useQuery({
    queryKey: purchasesKeys.supplierEvaluation(id),
    queryFn: () => purchasesService.getSupplierEvaluationById(id),
    enabled: !!id,
  })

export function useCreateSupplierEvaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: purchasesService.createSupplierEvaluation,
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.supplierEvaluations() }),
  })
}

export function useUpdateSupplierEvaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: purchasesService.CreateSupplierEvaluationRequest }) =>
      purchasesService.updateSupplierEvaluation(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.supplierEvaluations() }),
  })
}

export function useDeleteSupplierEvaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => purchasesService.deleteSupplierEvaluation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.supplierEvaluations() }),
  })
}

// ── Purchase Contracts ──
export const usePurchaseContractById = (id: string) =>
  useQuery({
    queryKey: purchasesKeys.purchaseContract(id),
    queryFn: () => purchasesService.getPurchaseContractById(id),
    enabled: !!id,
  })

export const usePurchaseContracts = (supplierId?: string) =>
  useQuery({
    queryKey: purchasesKeys.purchaseContracts(supplierId),
    queryFn: () => purchasesService.getPurchaseContracts(supplierId),
  })

export function useCreatePurchaseContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: purchasesService.createPurchaseContract,
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.purchaseContracts() }),
  })
}

export function useUpdatePurchaseContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: purchasesService.CreatePurchaseContractRequest }) =>
      purchasesService.updatePurchaseContract(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.purchaseContracts() }),
  })
}

export function useSetPurchaseContractStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      purchasesService.setPurchaseContractStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: purchasesKeys.purchaseContracts() }),
  })
}
