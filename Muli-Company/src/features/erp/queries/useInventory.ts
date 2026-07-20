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

// ── Stock Valuation ──

export const useStockValuation = (warehouseId?: string) =>
  useQuery({
    queryKey: ['erp', 'stock-valuation', warehouseId],
    queryFn: () => inventoryService.getStockValuation(warehouseId),
  })

export const useStockLowReorder = () =>
  useQuery({
    queryKey: ['erp', 'stock-low-reorder'],
    queryFn: inventoryService.getStockLowReorder,
  })

export function useSetStockLevels() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: inventoryService.SetStockLevelsRequest }) =>
      inventoryService.setStockLevels(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['erp', 'stock'] }),
  })
}

// ── Locations ──

export const useLocations = (warehouseId: string) =>
  useQuery({
    queryKey: ['erp', 'locations', warehouseId],
    queryFn: () => inventoryService.getLocations(warehouseId),
    enabled: !!warehouseId,
  })

export function useCreateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ warehouseId, data }: { warehouseId: string; data: inventoryService.CreateLocationRequest }) =>
      inventoryService.createLocation(warehouseId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['erp', 'locations'] }),
  })
}

export function useUpdateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ warehouseId, id, data }: { warehouseId: string; id: string; data: inventoryService.CreateLocationRequest }) =>
      inventoryService.updateLocation(warehouseId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['erp', 'locations'] }),
  })
}

export function useDeleteLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ warehouseId, id }: { warehouseId: string; id: string }) =>
      inventoryService.deleteLocation(warehouseId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['erp', 'locations'] }),
  })
}

// ── Reservations ──

export const useReservations = (warehouseId?: string) =>
  useQuery({
    queryKey: ['erp', 'reservations', warehouseId],
    queryFn: () => inventoryService.getReservations(warehouseId),
  })

export function useCreateReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.createReservation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['erp', 'reservations'] })
      qc.invalidateQueries({ queryKey: ['erp', 'stock'] })
    },
  })
}

export function useReleaseReservation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.releaseReservation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['erp', 'reservations'] })
      qc.invalidateQueries({ queryKey: ['erp', 'stock'] })
    },
  })
}

// ── Serials ──

export const useSerialsByProduct = (productId: string) =>
  useQuery({
    queryKey: ['erp', 'serials', 'product', productId],
    queryFn: () => inventoryService.getSerialsByProduct(productId),
    enabled: !!productId,
  })

export const useSerialsByWarehouse = (warehouseId: string) =>
  useQuery({
    queryKey: ['erp', 'serials', 'warehouse', warehouseId],
    queryFn: () => inventoryService.getSerialsByWarehouse(warehouseId),
    enabled: !!warehouseId,
  })

export function useRegisterSerial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.registerSerial,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['erp', 'serials'] }),
  })
}

export function useUpdateSerialStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      inventoryService.updateSerialStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['erp', 'serials'] }),
  })
}

// ── Physical Counts ──

export const usePhysicalCounts = (warehouseId?: string) =>
  useQuery({
    queryKey: ['erp', 'physical-counts', warehouseId],
    queryFn: () => inventoryService.getPhysicalCounts(warehouseId),
  })

export const usePhysicalCountById = (id: string) =>
  useQuery({
    queryKey: ['erp', 'physical-counts', id],
    queryFn: () => inventoryService.getPhysicalCountById(id),
    enabled: !!id,
  })

export function useCreatePhysicalCount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.createPhysicalCount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['erp', 'physical-counts'] }),
  })
}

export function useAddPhysicalCountLine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ countId, data }: { countId: string; data: { productId: string; expectedQuantity: number; notes?: string | null } }) =>
      inventoryService.addPhysicalCountLine(countId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['erp', 'physical-counts'] }),
  })
}

export function useRecordPhysicalCountLine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ lineId, data }: { lineId: string; data: { countedQuantity: number; notes?: string | null } }) =>
      inventoryService.recordPhysicalCountLine(lineId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['erp', 'physical-counts'] }),
  })
}

export function useCompletePhysicalCount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.completePhysicalCount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['erp', 'physical-counts'] }),
  })
}

export function useApprovePhysicalCount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.approvePhysicalCount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['erp', 'physical-counts'] })
      qc.invalidateQueries({ queryKey: ['erp', 'stock'] })
    },
  })
}

export function useCancelPhysicalCount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: inventoryService.cancelPhysicalCount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['erp', 'physical-counts'] }),
  })
}
