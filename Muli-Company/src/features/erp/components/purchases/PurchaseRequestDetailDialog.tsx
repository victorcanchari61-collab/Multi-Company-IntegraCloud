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
import { FileText, User, Calendar, Package, Tag, Building2, Flag } from 'lucide-react'
import type { PurchaseRequestDto } from '../../services/purchases.service'

const statusLabel: Record<string, string> = {
  Draft: 'Borrador', Pending: 'Pendiente', Approved: 'Aprobada', Rejected: 'Rechazada', Ordered: 'Ordenada',
}
const statusColor: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800', Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800', Rejected: 'bg-red-100 text-red-800',
  Ordered: 'bg-blue-100 text-blue-800',
}

interface Props {
  request: PurchaseRequestDto | null
  onOpenChange: (open: boolean) => void
}

export function PurchaseRequestDetailDialog({ request, onOpenChange }: Props) {
  if (!request) return null

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de solicitud de compra</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">N° Solicitud</span>
              <p className="font-medium break-words">{request.requestNumber}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <User className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div>
                <span className="text-sm text-muted-foreground">Solicitante</span>
                <p className="font-medium">{request.requesterName}</p>
              </div>
              {request.department && (
                <div>
                  <span className="text-sm text-muted-foreground">Departamento</span>
                  <p className="font-medium">{request.department}</p>
                </div>
              )}
            </div>
          </div>

          {request.supplierName && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Building2 className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Proveedor</span>
                <p className="font-medium">{request.supplierName}</p>
              </div>
            </div>
          )}

          {request.priority && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Flag className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Prioridad</span>
                <p className="font-medium capitalize">{request.priority}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Calendar className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div>
                <span className="text-sm text-muted-foreground">Fecha de solicitud</span>
                <p className="font-medium">{new Date(request.requestDate).toLocaleDateString()}</p>
              </div>
              {request.expectedDate && (
                <div>
                  <span className="text-sm text-muted-foreground">Fecha esperada</span>
                  <p className="font-medium">{new Date(request.expectedDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Tag className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">Estado</span>
              <div className="mt-0.5">
                <Badge className={statusColor[request.status]}>{statusLabel[request.status]}</Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Package className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">Productos</span>
              {request.items.length === 0 ? (
                <p className="text-sm text-muted-foreground/50 mt-1">Sin productos</p>
              ) : (
                <div className="overflow-auto rounded-md border mt-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="w-20 text-right">Cant.</TableHead>
                        <TableHead className="w-24 text-right">Precio est.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {request.items.map((i) => (
                        <TableRow key={i.id}>
                          <TableCell className="font-medium">{i.productName}</TableCell>
                          <TableCell className="text-right tabular-nums">{i.quantity}</TableCell>
                          <TableCell className="text-right tabular-nums">{i.estimatedPrice != null ? `S/ ${i.estimatedPrice.toFixed(2)}` : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {request.notes && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Notas</span>
                <p className="mt-0.5 text-sm whitespace-pre-wrap">{request.notes}</p>
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
