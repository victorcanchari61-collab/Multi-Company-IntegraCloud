import { FileText, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
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

const MAX_IMAGE = 2 * 1024 * 1024 // 2 MB
const MAX_PDF = 5 * 1024 * 1024 // 5 MB

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const dropzone =
  'mt-2 cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 text-center transition-colors hover:border-primary/50'

export function InfoTab({ api }: { api: ProductFormApi }) {
  const { form, imageInputRef, pdfInputRef } = api
  const imageUrl = form.watch('imageUrl')
  const technicalSheetUrl = form.watch('technicalSheetUrl')

  const onImage = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Selecciona una imagen válida')
    if (file.size > MAX_IMAGE) return toast.error('La imagen supera 2 MB')
    form.setValue('imageUrl', await readAsDataUrl(file))
  }

  const onPdf = async (file?: File) => {
    if (!file) return
    if (file.type !== 'application/pdf') return toast.error('Selecciona un archivo PDF')
    if (file.size > MAX_PDF) return toast.error('El PDF supera 5 MB')
    form.setValue('technicalSheetUrl', await readAsDataUrl(file))
  }

  const clearImage = () => {
    form.setValue('imageUrl', '')
    if (imageInputRef.current) imageInputRef.current.value = ''
  }
  const clearPdf = () => {
    form.setValue('technicalSheetUrl', '')
    if (pdfInputRef.current) pdfInputRef.current.value = ''
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* ── Imagen ── */}
        <div>
          <FormLabel>
            Imagen del producto <span className="text-muted-foreground">(opcional)</span>
          </FormLabel>
          {imageUrl ? (
            <div className="relative mt-2 overflow-hidden rounded-lg border">
              <img src={imageUrl} alt="Producto" className="h-40 w-full bg-muted/30 object-contain" />
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="absolute right-2 top-2 shadow-sm"
                onClick={clearImage}
                title="Quitar imagen"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div
              className={dropzone}
              onClick={() => imageInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') imageInputRef.current?.click()
              }}
              role="button"
              tabIndex={0}
            >
              <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
              <Button type="button" variant="secondary" size="sm">
                <Upload className="mr-1 size-3.5" /> Subir imagen
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">PNG, JPG o WebP · máx 2 MB</p>
            </div>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => onImage(e.target.files?.[0])}
          />
        </div>

        {/* ── Ficha técnica ── */}
        <div>
          <FormLabel>
            Ficha técnica <span className="text-muted-foreground">(opcional)</span>
          </FormLabel>
          {technicalSheetUrl ? (
            <div className="mt-2 flex items-center gap-2 rounded-lg border p-3">
              <FileText className="size-5 shrink-0 text-primary" />
              <span className="flex-1 truncate text-sm">Ficha técnica cargada</span>
              <a
                href={technicalSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-primary hover:underline"
              >
                Ver
              </a>
              <Button type="button" variant="ghost" size="icon-sm" onClick={clearPdf} title="Quitar ficha">
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div
              className={dropzone}
              onClick={() => pdfInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') pdfInputRef.current?.click()
              }}
              role="button"
              tabIndex={0}
            >
              <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
              <Button type="button" variant="secondary" size="sm">
                <Upload className="mr-1 size-3.5" /> Subir ficha técnica
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">PDF · máx 5 MB</p>
            </div>
          )}
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => onPdf(e.target.files?.[0])}
          />
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
