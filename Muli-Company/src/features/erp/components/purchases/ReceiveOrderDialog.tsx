import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PurchaseOrderDto } from '../../services/purchases.service'

interface Props {
  order: PurchaseOrderDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (items: { productId: string; quantity: number }[]) => Promise<void>
}

export function ReceiveOrderDialog({ order, open, onOpenChange, onSave }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  const items = order?.items ?? []

  const handleOpenChange = (val: boolean) => {
    if (!val) onOpenChange(false)
  }

  const handleSave = async () => {
    if (!order) return
    setSaving(true)
    try {
      const receivedItems = items.map((i) => ({
        productId: i.productId,
        quantity: quantities[i.id] ?? i.quantity,
      })).filter((i) => i.quantity > 0)
      await onSave(receivedItems)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recibir orden: {order?.orderNumber}</DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay productos en esta orden.</p>
        ) : (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-20 text-right">Pedido</TableHead>
                  <TableHead className="w-24 text-right">Recibido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.productName}</TableCell>
                    <TableCell className="text-right tabular-nums">{i.quantity}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        max={i.quantity}
                        step={1}
                        className="w-20 ml-auto h-8 text-right"
                        defaultValue={quantities[i.id] ?? (i.quantity - (i.quantityReceived ?? 0))}
                        onChange={(e) => {
                          const val = Math.min(i.quantity, Math.max(0, Number(e.target.value) || 0))
                          setQuantities((prev) => ({ ...prev, [i.id]: val }))
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || items.length === 0}>
            {saving ? 'Guardando...' : 'Confirmar recepción'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
