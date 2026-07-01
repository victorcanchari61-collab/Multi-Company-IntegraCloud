import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'

export interface WarehouseDto {
  id: string
  code: string
  name: string
  type: string | null
  location: string | null
  isActive: boolean
}

export interface CreateWarehouseRequest {
  code: string
  name: string
  type: string | null
  location: string | null
}

export interface StockDto {
  id: string
  productId: string
  productName: string
  productSku: string | null
  warehouseId: string
  warehouseName: string
  quantity: number
  reservedQuantity: number
  available: number
}

export interface StockMovementDto {
  id: string
  productId: string
  productName: string
  productSku: string | null
  warehouseId: string
  warehouseName: string
  movementType: string
  quantity: number
  unitCost: number | null
  referenceType: string | null
  referenceId: string | null
  notes: string | null
  createdAt: string
}

export interface CreateStockMovementRequest {
  productId: string
  warehouseId: string
  movementType: string
  quantity: number
  unitCost?: number | null
  referenceType?: string | null
  referenceId?: string | null
  notes?: string | null
}

export interface TransferDto {
  id: string
  fromWarehouse: string
  toWarehouse: string
  status: string
  notes: string | null
  createdAt: string
  completedAt: string | null
  items: TransferItemDto[]
}

export interface TransferItemDto {
  id: string
  productId: string
  productName: string | null
  quantity: number
  unitCost: number | null
}

export interface CreateTransferRequest {
  fromWarehouseId: string
  toWarehouseId: string
  notes?: string | null
  items: { productId: string; quantity: number; unitCost?: number | null }[]
}

export interface KardexEntryDto {
  id: string
  productId: string
  productName: string | null
  warehouseId: string
  warehouseName: string | null
  movementType: string
  quantityIn: number
  quantityOut: number
  balance: number
  previousBalance: number
  unitCost: number | null
  totalCost: number | null
  referenceType: string | null
  notes: string | null
  createdAt: string
}

export interface LocationDto {
  id: string
  warehouseId: string
  warehouseName: string
  code: string
  description: string | null
  zone: string | null
  parentId: string | null
  parentCode: string | null
  isActive: boolean
}

export interface CreateLocationRequest {
  code: string
  description?: string | null
  zone?: string | null
  parentId?: string | null
}

export interface StockValuationDto {
  id: string
  productId: string
  productName: string
  productSku: string | null
  warehouseId: string
  warehouseName: string
  quantity: number
  unitCost: number | null
  totalValue: number
}

export interface StockReservationDto {
  id: string
  productId: string
  productName: string
  productSku: string | null
  warehouseId: string
  warehouseName: string
  quantity: number
  status: string
  referenceType: string | null
  referenceId: string | null
  notes: string | null
  createdAt: string
}

export interface CreateReservationRequest {
  productId: string
  warehouseId: string
  quantity: number
  referenceType?: string | null
  referenceId?: string | null
  notes?: string | null
}

export interface SerialNumberDto {
  id: string
  productId: string
  productName: string
  productSku: string | null
  batchId: string | null
  batchNumber: string | null
  serial: string
  status: string
  warehouseId: string
  warehouseName: string
  locationId: string | null
}

export interface RegisterSerialRequest {
  productId: string
  batchId?: string | null
  serial: string
  warehouseId: string
  locationId?: string | null
}

export interface PhysicalCountDto {
  id: string
  warehouseId: string
  warehouseName: string
  status: string
  notes: string | null
  createdAt: string
  lineCount: number
  countedLines: number
}

export interface PhysicalCountLineDto {
  id: string
  productId: string
  productName: string
  productSku: string | null
  expectedQuantity: number
  countedQuantity: number | null
  difference: number
  notes: string | null
  status: string
}

export interface PhysicalCountDetailDto {
  id: string
  warehouseId: string
  warehouseName: string
  status: string
  notes: string | null
  createdAt: string
  completedAt: string | null
  approvedAt: string | null
  lines: PhysicalCountLineDto[]
}

export interface CreatePhysicalCountRequest {
  warehouseId: string
  notes?: string | null
}

export interface SetStockLevelsRequest {
  minStock?: number | null
  maxStock?: number | null
}

// ── Warehouses ──

export const getWarehouses = (): Promise<WarehouseDto[]> =>
  api.get<WarehouseDto[]>(API_ENDPOINTS.ERP.warehouses)

export const createWarehouse = (data: CreateWarehouseRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.ERP.warehouses, data)

export const updateWarehouse = (id: string, data: CreateWarehouseRequest): Promise<void> =>
  api.put<void>(API_ENDPOINTS.ERP.warehouse(id), data)

export const setWarehouseStatus = (id: string, isActive: boolean): Promise<void> =>
  api.post<void>(API_ENDPOINTS.ERP.warehouseStatus(id), { isActive })

// ── Stock ──

export const getStockByWarehouse = (warehouseId: string): Promise<StockDto[]> =>
  api.get<StockDto[]>(API_ENDPOINTS.ERP.stockByWarehouse(warehouseId))

export const createStockMovement = (data: CreateStockMovementRequest): Promise<void> =>
  api.post<void>(API_ENDPOINTS.ERP.stockMovement, data)

export const getStockMovements = (params?: { warehouseId?: string; productId?: string }): Promise<StockMovementDto[]> => {
  const search = new URLSearchParams()
  if (params?.warehouseId) search.set('warehouseId', params.warehouseId)
  if (params?.productId) search.set('productId', params.productId)
  const qs = search.toString()
  return api.get<StockMovementDto[]>(API_ENDPOINTS.ERP.stockMovements + (qs ? `?${qs}` : ''))
}

// ── Transfers ──

export const getTransfers = (): Promise<TransferDto[]> =>
  api.get<TransferDto[]>(API_ENDPOINTS.ERP.transfers)

export const getTransferById = (id: string): Promise<TransferDto> =>
  api.get<TransferDto>(API_ENDPOINTS.ERP.transfer(id))

export const createTransfer = (data: CreateTransferRequest): Promise<string> =>
  api.post<string>(API_ENDPOINTS.ERP.transfers, data)

export const completeTransfer = (id: string): Promise<void> =>
  api.post<void>(API_ENDPOINTS.ERP.transferComplete(id))

export const cancelTransfer = (id: string): Promise<void> =>
  api.post<void>(API_ENDPOINTS.ERP.transferCancel(id))

// ── Kardex ──

export const getKardexByProduct = (productId: string): Promise<KardexEntryDto[]> =>
  api.get<KardexEntryDto[]>(API_ENDPOINTS.ERP.kardexByProduct(productId))
