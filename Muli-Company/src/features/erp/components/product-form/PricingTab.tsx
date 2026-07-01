import { Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProductFormApi } from '../../hooks/useProductForm'

export function PricingTab({ api }: { api: ProductFormApi }) {
  const { form, fields, append, remove, setSearchRowIdx } = api

  return (
    <>
      {/* ── Precios ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="salePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio de venta</FormLabel>
              <FormControl>
                <Input type="number" step="0.0001" min="0" placeholder="0.0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="costPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio de costo</FormLabel>
              <FormControl>
                <Input type="number" step="0.0001" min="0" placeholder="0.0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Lote inicial ── */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs font-semibold text-muted-foreground">
            Lote inicial
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <FormField
          control={form.control}
          name="loteNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>N° de lote</FormLabel>
              <FormControl>
                <Input placeholder="LOTE-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="loteExpiry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vencimiento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="loteStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock entero</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="loteStockFraction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock fracción</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Detalle de precios ── */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Detalle de precios</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              formatoVenta: '',
              factor: '',
              productoC: '',
              complementaryProductId: '',
              cantidadC: '',
              precioCompra: '',
              porcentajeVenta: '',
            })
          }
        >
          <Plus className="size-3.5 mr-1" /> Agregar unidad derivada
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader className="[&_tr]:border-b-0">
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0 w-8 text-center">#</TableHead>
              <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">Formato de venta</TableHead>
              <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">Factor</TableHead>
              <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">Prod. complementario</TableHead>
              <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">Cant. compl.</TableHead>
              <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">P. compra</TableHead>
              <TableHead className="relative h-[30px] border-r border-primary-foreground/20 px-1.5 py-0 text-xs font-medium text-primary-foreground last:border-r-0">% venta</TableHead>
              <TableHead className="relative h-[30px] px-1.5 py-0 text-xs font-medium text-primary-foreground w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-6 text-xs">
                  Sin unidades derivadas. Haga clic en "Agregar unidad derivada".
                </TableCell>
              </TableRow>
            )}
            {fields.map((f, idx) => (
              <TableRow key={f.id}>
                <TableCell className="text-xs text-muted-foreground text-center">{idx + 1}</TableCell>
                <TableCell>
                  <Select
                    value={form.watch(`priceRows.${idx}.formatoVenta`) ?? ''}
                    onValueChange={(v) => form.setValue(`priceRows.${idx}.formatoVenta`, v ?? '')}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="UND. DERIVADA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAJA">CAJA</SelectItem>
                      <SelectItem value="BOLSA">BOLSA</SelectItem>
                      <SelectItem value="PACK">PACK</SelectItem>
                      <SelectItem value="DOCENA">DOCENA</SelectItem>
                      <SelectItem value="UNIDAD">UNIDAD</SelectItem>
                      <SelectItem value="MEDIA_DOCENA">MEDIA DOCENA</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="1.000"
                    value={form.watch(`priceRows.${idx}.factor`) ?? ''}
                    onChange={(e) => form.setValue(`priceRows.${idx}.factor`, e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Input
                      className="h-8 text-xs flex-1"
                      placeholder="Buscar producto..."
                      value={form.watch(`priceRows.${idx}.productoC`) ?? ''}
                      onChange={(e) => form.setValue(`priceRows.${idx}.productoC`, e.target.value)}
                    />
                    <button type="button" onClick={() => setSearchRowIdx(idx)}>
                      <Search className="size-3.5 text-muted-foreground shrink-0" />
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    min="0"
                    placeholder="Cant."
                    value={form.watch(`priceRows.${idx}.cantidadC`) ?? ''}
                    onChange={(e) => form.setValue(`priceRows.${idx}.cantidadC`, e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="h-8 text-xs"
                    placeholder="S/. 0.0000"
                    value={form.watch(`priceRows.${idx}.precioCompra`) ?? ''}
                    onChange={(e) => form.setValue(`priceRows.${idx}.precioCompra`, e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Input
                      className="h-8 text-xs w-16"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.watch(`priceRows.${idx}.porcentajeVenta`) ?? ''}
                      onChange={(e) => form.setValue(`priceRows.${idx}.porcentajeVenta`, e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
