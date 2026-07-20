import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Building2, Calendar, User, Star, MessageSquareText } from 'lucide-react'
import type { SupplierEvaluationDto } from '../../services/purchases.service'

interface Props {
  evaluation: SupplierEvaluationDto | null
  onOpenChange: (open: boolean) => void
}

export function SupplierEvaluationDetailDialog({ evaluation, onOpenChange }: Props) {
  if (!evaluation) return null

  const groups: { icon: typeof Building2; items: [string, string | null][] }[] = [
    {
      icon: Building2,
      items: [['Proveedor', evaluation.supplierName]],
    },
    {
      icon: Calendar,
      items: [
        ['Fecha', new Date(evaluation.evaluationDate).toLocaleDateString()],
      ],
    },
    {
      icon: User,
      items: [['Evaluador', evaluation.evaluatedBy]],
    },
    {
      icon: Star,
      items: [
        ['Puntaje general', `${evaluation.score}/5`],
        ['Precio', evaluation.priceRating != null ? `${evaluation.priceRating}/5` : null],
        ['Calidad', evaluation.qualityRating != null ? `${evaluation.qualityRating}/5` : null],
        ['Entrega', evaluation.deliveryRating != null ? `${evaluation.deliveryRating}/5` : null],
        ['Servicio', evaluation.serviceRating != null ? `${evaluation.serviceRating}/5` : null],
      ],
    },
  ]

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle de evaluación</DialogTitle>
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

          {evaluation.comments && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <MessageSquareText className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Comentarios</span>
                <p className="mt-0.5 text-sm whitespace-pre-wrap">{evaluation.comments}</p>
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
