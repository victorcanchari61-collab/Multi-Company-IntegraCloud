import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  minStock: z.string().optional().refine((v) => !v || Number(v) >= 0, 'Debe ser ≥ 0'),
  maxStock: z.string().optional().refine((v) => !v || Number(v) >= 0, 'Debe ser ≥ 0'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  currentMin: number | null | undefined
  currentMax: number | null | undefined
  onSave: (data: { minStock: number | null; maxStock: number | null }) => void
  saving: boolean
}

export function StockLevelDialog({ open, onOpenChange, productName, currentMin, currentMax, onSave, saving }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { minStock: '', maxStock: '' },
  })

  const onSubmit = (values: FormValues) => {
    onSave({
      minStock: values.minStock ? Number(values.minStock) : null,
      maxStock: values.maxStock ? Number(values.maxStock) : null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Niveles de reposición</DialogTitle>
          <DialogDescription>
            Define el stock mínimo y máximo para <strong>{productName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="minStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock mínimo</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder={currentMin?.toString() ?? '0'} {...field} />
                  </FormControl>
                  {currentMin != null && <p className="text-xs text-muted-foreground">Actual: {currentMin}</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock máximo</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" placeholder={currentMax?.toString() ?? '0'} {...field} />
                  </FormControl>
                  {currentMax != null && <p className="text-xs text-muted-foreground">Actual: {currentMax}</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar niveles'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
