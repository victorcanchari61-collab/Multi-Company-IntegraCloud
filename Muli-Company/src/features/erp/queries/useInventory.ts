import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as inventoryService from '../services/inventory.service'

export const inventoryKeys = {
  warehouses: { all: ['erp', 'warehouses'] as const },
  stockByWarehouse: (warehouseId: string) => ['erp', 'stock', warehouseId] as const,
  stockMovements: (params?: { warehouseId?: string; productId?: string }) =>
    ['erp', 'stock-movements', params] as const,
  transfers: { all: ['erp', 'transfers'] as const },
  transfer: (id: string) => ['erp', 'transfers', id] as const,
  kardexByProduct: (productId: string) => ['erp', 'kardex', productId] as const,
}

// ── Warehouses ──

export const useWarehouses = () =>
  useQuery({ queryKey: inventoryKeys.warehouses.all, queryFn: inventoryService.getWarehouses })

export function useCreateWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.createWarehouse,
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.warehouses.all }),
  })
}

export function useUpdateWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: inventoryService.CreateWarehouseRequest }) =>
      inventoryService.updateWarehouse(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.warehouses.all }),
  })
}

export function useSetWarehouseStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      inventoryService.setWarehouseStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.warehouses.all }),
  })
}

// ── Stock ──

export const useStockByWarehouse = (warehouseId: string) =>
  useQuery({
    queryKey: inventoryKeys.stockByWarehouse(warehouseId),
    queryFn: () => inventoryService.getStockByWarehouse(warehouseId),
    enabled: !!warehouseId,
  })

export const useStockMovements = (params?: { warehouseId?: string; productId?: string }) =>
  useQuery({
    queryKey: inventoryKeys.stockMovements(params),
    queryFn: () => inventoryService.getStockMovements(params),
  })

export function useCreateStockMovement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.createStockMovement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['erp', 'stock'] })
      qc.invalidateQueries({ queryKey: ['erp', 'stock-movements'] })
    },
  })
}

// ── Transfers ──

export const useTransfers = () =>
  useQuery({ queryKey: inventoryKeys.transfers.all, queryFn: inventoryService.getTransfers })

export const useTransferById = (id: string) =>
  useQuery({
    queryKey: inventoryKeys.transfer(id),
    queryFn: () => inventoryService.getTransferById(id),
    enabled: !!id,
  })

export function useCreateTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.createTransfer,
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.transfers.all }),
  })
}

export function useCompleteTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.completeTransfer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.transfers.all })
      qc.invalidateQueries({ queryKey: ['erp', 'stock'] })
    },
  })
}

export function useCancelTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.cancelTransfer,
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.transfers.all }),
  })
}

// ── Kardex ──

export const useKardexByProduct = (productId: string) =>
  useQuery({
    queryKey: inventoryKeys.kardexByProduct(productId),
    queryFn: () => inventoryService.getKardexByProduct(productId),
    enabled: !!productId,
  })
