import { useState } from 'react'
import { CirclePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormLabel } from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'

/** Crea una entidad de catálogo (categoría, marca, unidad…) al vuelo desde el form. */
export async function handleQuickCreate(
  mutation: { mutateAsync: (...args: never[]) => Promise<string> },
  field: 'categoryId' | 'subcategoryId' | 'brandId' | 'subbrandId' | 'unitOfMeasureId',
  name: string,
  extra?: string,
) {
  if (!name.trim()) return
  try {
    const payload: Record<string, string> = { name: name.trim() }
    if (field === 'subcategoryId' && extra) payload.categoryId = extra
    else if (field === 'subbrandId' && extra) payload.brandId = extra
    else if (field === 'unitOfMeasureId' && extra) payload.abbreviation = extra
    else if (extra) payload.description = extra

    await mutation.mutateAsync(payload as never)
    toast.success(`"${name.trim()}" creado`)
  } catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'Error al crear')
  }
}

interface QcField {
  label: string
  required: boolean
}

/** Botón "+" con mini-modal para alta rápida de un catálogo. */
export function QuickCreateButton({
  label,
  fields,
  onSave,
}: {
  label: string
  fields: QcField[]
  onSave: (values: string[]) => Promise<unknown>
}) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<string[]>(() => fields.map(() => ''))
  const [saving, setSaving] = useState(false)
  const disabled = fields.some((f, i) => f.required && !values[i]?.trim())

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(values)
      setOpen(false)
      setValues(fields.map(() => ''))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Nueva ${label}`}
        className="shrink-0 self-end pb-1 text-emerald-600 hover:text-emerald-700 hover:scale-110 transition-transform"
      >
        <CirclePlus className="size-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva {label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {fields.map((f, i) => (
              <div key={f.label}>
                <FormLabel>
                  {f.required && <span className="text-destructive mr-1">*</span>}
                  {f.label}
                </FormLabel>
                <Input
                  placeholder={f.label}
                  value={values[i]}
                  onChange={(e) =>
                    setValues((prev) => {
                      const next = [...prev]
                      next[i] = e.target.value
                      return next
                    })
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={disabled || saving} onClick={handleSave}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
