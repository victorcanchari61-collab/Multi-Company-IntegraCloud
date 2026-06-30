import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import type { ProductFormApi } from '../../hooks/useProductForm'

export function InfoTab({ api }: { api: ProductFormApi }) {
  const { form, imageInputRef, pdfInputRef } = api

  return (
    <>
      {/* ── Adjuntar archivos ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FormLabel>
            Imagen del producto <span className="text-muted-foreground">(opcional)</span>
          </FormLabel>
          <div
            className="mt-2 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => imageInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') imageInputRef.current?.click()
            }}
            role="button"
            tabIndex={0}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />
            <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
            <Button type="button" variant="secondary" size="sm">
              <Upload className="size-3.5 mr-1" /> Subir imagen
            </Button>
            <p className="text-xs text-muted-foreground mt-2">PNG, JPG o WebP</p>
          </div>
        </div>
        <div>
          <FormLabel>
            Ficha técnica <span className="text-muted-foreground">(opcional)</span>
          </FormLabel>
          <div
            className="mt-2 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => pdfInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') pdfInputRef.current?.click()
            }}
            role="button"
            tabIndex={0}
          >
            <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" />
            <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
            <Button type="button" variant="secondary" size="sm">
              <Upload className="size-3.5 mr-1" /> Subir ficha técnica
            </Button>
            <p className="text-xs text-muted-foreground mt-2">PDF</p>
          </div>
        </div>
      </div>

      {/* ── Acción técnica ── */}
      <FormField
        control={form.control}
        name="technicalAction"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Acción técnica <span className="text-muted-foreground">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Instrucciones de uso, advertencias, aplicaciones recomendadas..."
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
