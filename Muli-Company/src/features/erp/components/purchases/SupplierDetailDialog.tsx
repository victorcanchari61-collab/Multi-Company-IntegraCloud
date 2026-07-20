import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Building2, MapPin, Phone, User, CreditCard, Tag } from 'lucide-react'
import type { SupplierDto } from '../../services/purchases.service'

interface Props {
  supplier: SupplierDto | null
  onOpenChange: (open: boolean) => void
}

export function SupplierDetailDialog({ supplier, onOpenChange }: Props) {
  if (!supplier) return null

  const groups: { icon: typeof Building2; items: [string, string | null][] }[] = [
    {
      icon: Building2,
      items: [
        ['RUC', supplier.code],
        ['Razón social', supplier.businessName],
        ['Nombre comercial', supplier.tradeName],
      ],
    },
    {
      icon: MapPin,
      items: [
        ['Dirección', supplier.address],
      ],
    },
    {
      icon: Phone,
      items: [
        ['Teléfono', supplier.phone],
        ['Email', supplier.email],
      ],
    },
    {
      icon: User,
      items: [
        ['Contacto', supplier.contactPerson],
      ],
    },
    {
      icon: CreditCard,
      items: [
        ['Condiciones de pago', supplier.paymentTerms],
        ['Línea de crédito', supplier.creditLimit != null ? `S/ ${supplier.creditLimit.toFixed(2)}` : null],
      ],
    },
  ]

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del proveedor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {groups.map(({ icon: Icon, items }) => {
            const hasValue = items.some(([, v]) => v != null)
            if (!hasValue) return null
            return (
              <div key={items[0][0]} className="flex gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  {items.map(([label, value]) => (
                    <div key={label} className="text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <p className="font-medium break-words">
                        {value ?? <span className="text-muted-foreground/50">—</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Tag className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">Estado</span>
              <div className="mt-0.5">
                <StatusBadge isActive={supplier.isActive} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
