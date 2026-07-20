import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { FileText, Building2, Calendar, DollarSign, Tag } from 'lucide-react'
import type { PurchaseOrderDto } from '../../services/purchases.service'

const statusLabel: Record<string, string> = {
  Draft: 'Borrador', Issued: 'Emitida', Partial: 'Parcial', Received: 'Recibida', Closed: 'Cerrada', Cancelled: 'Anulada',
}
const statusColor: Record<string, string> = {
  Draft: 'bg-yellow-100 text-yellow-800', Issued: 'bg-blue-100 text-blue-800',
  Partial: 'bg-orange-100 text-orange-800', Received: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-800', Cancelled: 'bg-red-100 text-red-800',
}

interface Props {
  order: PurchaseOrderDto | null
  onOpenChange: (open: boolean) => void
}

export function PurchaseOrderDetailDialog({ order, onOpenChange }: Props) {
  if (!order) return null

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de orden de compra</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">N° Orden</span>
              <p className="font-medium break-words">{order.orderNumber}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Building2 className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">Proveedor</span>
              <p className="font-medium break-words">{order.supplierName}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Calendar className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div>
                <span className="text-sm text-muted-foreground">Emisión</span>
                <p className="font-medium">{new Date(order.issueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Esperada</span>
                <p className="font-medium">{order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : <span className="text-muted-foreground/50">—</span>}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Tag className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">Estado</span>
              <div className="mt-0.5">
                <Badge className={statusColor[order.status]}>{statusLabel[order.status]}</Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <DollarSign className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <span className="text-sm text-muted-foreground">Productos</span>
              {order.items.length === 0 ? (
                <p className="text-sm text-muted-foreground/50">Sin productos</p>
              ) : (
                <div className="overflow-auto rounded-md border mt-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="w-20 text-right">Cant.</TableHead>
                        {order.status !== 'Draft' && order.status !== 'Issued' && (
                          <TableHead className="w-20 text-right">Recibido</TableHead>
                        )}
                        <TableHead className="w-24 text-right">Precio</TableHead>
                        <TableHead className="w-24 text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((i) => (
                        <TableRow key={i.id}>
                          <TableCell className="font-medium">{i.productName}</TableCell>
                          <TableCell className="text-right tabular-nums">{i.quantity}</TableCell>
                          {order.status !== 'Draft' && order.status !== 'Issued' && (
                            <TableCell className="text-right tabular-nums">{i.quantityReceived ?? 0}</TableCell>
                          )}
                          <TableCell className="text-right tabular-nums">S/ {i.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right tabular-nums">S/ {i.subTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="space-y-1 text-sm pt-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">S/ {order.subTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IGV (18%)</span><span className="tabular-nums">S/ {order.tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Total</span><span className="tabular-nums">S/ {order.total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Notas</span>
                <p className="mt-0.5 text-sm whitespace-pre-wrap">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
