import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Building2, Calendar, DollarSign, Tag } from 'lucide-react'
import type { PurchaseContractDto } from '../../services/purchases.service'

interface Props {
  contract: PurchaseContractDto | null
  onOpenChange: (open: boolean) => void
}

export function ContractDetailDialog({ contract, onOpenChange }: Props) {
  if (!contract) return null

  const groups: { icon: typeof FileText; items: [string, string | null][] }[] = [
    {
      icon: FileText,
      items: [
        ['N° Contrato', contract.contractNumber],
        ['Título', contract.title],
      ],
    },
    {
      icon: Building2,
      items: [
        ['Proveedor', contract.supplierName],
      ],
    },
    {
      icon: Calendar,
      items: [
        ['Inicio', new Date(contract.startDate).toLocaleDateString()],
        ['Fin', new Date(contract.endDate).toLocaleDateString()],
      ],
    },
    {
      icon: DollarSign,
      items: [
        ['Valor', contract.value != null ? `S/ ${contract.value.toFixed(2)}` : null],
      ],
    },
  ]

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle del contrato</DialogTitle>
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

          {contract.terms && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Términos</span>
                <p className="mt-0.5 text-sm whitespace-pre-wrap">{contract.terms}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Tag className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">Estado</span>
              <div className="mt-0.5">
                <StatusBadge isActive={contract.isActive} activeLabel="Vigente" />
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
