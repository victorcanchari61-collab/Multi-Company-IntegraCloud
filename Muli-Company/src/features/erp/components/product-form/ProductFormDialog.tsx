import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductSearchDialog } from '../ProductSearchDialog'
import { GeneralTab } from './GeneralTab'
import { PricingTab } from './PricingTab'
import { InfoTab } from './InfoTab'
import { useProductForm, type UseProductFormArgs } from '../../hooks/useProductForm'

/** Shell del formulario de producto: solo monta el Dialog, las Tabs y el submit. */
export function ProductFormDialog(props: UseProductFormArgs) {
  const api = useProductForm(props)
  const { isEdit, open, setOpen, saving, form, onSubmit, searchRowIdx, setSearchRowIdx, onClose } = api

  return (
    <>
      {!isEdit && (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Nuevo producto
        </Button>
      )}
      <Dialog open={isEdit ? true : open} onOpenChange={isEdit ? (o) => !o && onClose?.() : setOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
            <DialogDescription>
              Completa los datos del producto. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <Tabs defaultValue="datos">
                <TabsList className="w-full">
                  <TabsTrigger value="datos" className="flex-1">Datos iniciales</TabsTrigger>
                  <TabsTrigger value="lote-precios" className="flex-1">Lote y precios</TabsTrigger>
                  <TabsTrigger value="info" className="flex-1">Información adicional</TabsTrigger>
                </TabsList>

                <div className="-mx-1 max-h-[60vh] overflow-y-auto px-1 pt-4 pb-1">
                  <TabsContent value="datos" className="space-y-5">
                    <GeneralTab api={api} />
                  </TabsContent>
                  <TabsContent value="lote-precios" className="space-y-5">
                    <PricingTab api={api} />
                  </TabsContent>
                  <TabsContent value="info" className="space-y-5">
                    <InfoTab api={api} />
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter>
                {isEdit && (
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ProductSearchDialog
        open={searchRowIdx !== null}
        onOpenChange={(o) => {
          if (!o) setSearchRowIdx(null)
        }}
        onSelect={(product) => {
          if (searchRowIdx !== null) {
            form.setValue(`priceRows.${searchRowIdx}.productoC`, product.name)
            form.setValue(`priceRows.${searchRowIdx}.complementaryProductId`, product.id)
            if (product.salePrice != null) {
              form.setValue(`priceRows.${searchRowIdx}.precioCompra`, product.salePrice.toString())
            }
            setSearchRowIdx(null)
          }
        }}
      />
    </>
  )
}
