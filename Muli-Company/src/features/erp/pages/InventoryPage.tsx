import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WarehousesSection } from '../sections/inventory/WarehousesSection'
import { CurrentStockSection } from '../sections/inventory/CurrentStockSection'
import { StockMovementsSection } from '../sections/inventory/StockMovementsSection'
import { TransfersSection } from '../sections/inventory/TransfersSection'

const TABS = [
  { value: 'almacenes', label: 'Almacenes', Section: WarehousesSection },
  { value: 'stock', label: 'Stock actual', Section: CurrentStockSection },
  { value: 'movimientos', label: 'Movimientos', Section: StockMovementsSection },
  { value: 'transferencias', label: 'Transferencias', Section: TransfersSection },
] as const

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Módulo de inventario</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona almacenes, stock, movimientos y transferencias entre almacenes.
        </p>
      </div>
      <Tabs defaultValue="almacenes">
        <TabsList className="w-full flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="flex-1 min-w-[100px]">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(({ value, Section }) => (
          <TabsContent key={value} value={value} className="pt-4">
            <Section />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
