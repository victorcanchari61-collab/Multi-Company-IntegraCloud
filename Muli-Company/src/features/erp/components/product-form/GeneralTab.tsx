import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import { QuickCreateButton, handleQuickCreate } from './QuickCreateButton'
import type { ProductFormApi } from '../../hooks/useProductForm'

export function GeneralTab({ api }: { api: ProductFormApi }) {
  const {
    form,
    categories,
    brands,
    units,
    filteredSubcategories,
    filteredSubbrands,
    catId,
    brandId,
    createCat,
    createSubcat,
    createBrand,
    createSubbrand,
    createUnit,
  } = api

  return (
    <>
      {/* ── Códigos y estado ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cód. Producto</FormLabel>
              <FormControl>
                <Input placeholder="CÓDIGO DE PRODUCTO" disabled={form.watch('autoCode')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="autoCode"
          render={({ field }) => (
            <FormItem className="mt-6">
              <FormControl>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="autoCode"
                    checked={field.value ?? true}
                    onCheckedChange={(v) => {
                      field.onChange(v === true)
                      if (v) form.setValue('code', '')
                    }}
                  />
                  <Label htmlFor="autoCode" className="text-xs font-normal">
                    Código automático
                  </Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cod. de barra</FormLabel>
              <FormControl>
                <Input placeholder="EAN / UPC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="Código interno" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select value={field.value ?? 'true'} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Nombre y descripción ── */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del producto *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Cemento Sol Tipo I 42.5 kg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Descripción <span className="text-muted-foreground">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción del producto" rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ticketDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Descripción ticket <span className="text-muted-foreground">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Texto que aparecerá en el ticket" rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Categorización ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <div className="flex gap-2">
                <Select
                  value={field.value ?? ''}
                  onValueChange={(v) => {
                    field.onChange(v)
                    form.setValue('subcategoryId', '')
                  }}
                  items={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <QuickCreateButton
                  label="categoría"
                  fields={[
                    { label: 'Nombre', required: true },
                    { label: 'Descripción', required: false },
                  ]}
                  onSave={([name, desc]) => handleQuickCreate(createCat, 'categoryId', name, desc)}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subcategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subcategoría</FormLabel>
              <div className="flex gap-2">
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  disabled={!catId}
                  items={filteredSubcategories.map((s) => ({ value: s.id, label: s.name }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubcategories.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <QuickCreateButton
                  label="subcategoría"
                  fields={[{ label: 'Nombre', required: true }]}
                  onSave={([name]) => handleQuickCreate(createSubcat, 'subcategoryId', name, catId)}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Marca y submarca ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <div className="flex gap-2">
                <Select
                  value={field.value ?? ''}
                  onValueChange={(v) => {
                    field.onChange(v)
                    form.setValue('subbrandId', '')
                  }}
                  items={brands?.map((b) => ({ value: b.id, label: b.name })) ?? []}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <QuickCreateButton
                  label="marca"
                  fields={[
                    { label: 'Nombre', required: true },
                    { label: 'Descripción', required: false },
                  ]}
                  onSave={([name, desc]) => handleQuickCreate(createBrand, 'brandId', name, desc)}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subbrandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Submarca</FormLabel>
              <div className="flex gap-2">
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  disabled={!brandId}
                  items={filteredSubbrands.map((s) => ({ value: s.id, label: s.name }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar submarca" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubbrands.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <QuickCreateButton
                  label="submarca"
                  fields={[{ label: 'Nombre', required: true }]}
                  onSave={([name]) => handleQuickCreate(createSubbrand, 'subbrandId', name, brandId)}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Unidad, stock ── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <FormField
          control={form.control}
          name="unitOfMeasureId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidad de medida *</FormLabel>
              <div className="flex gap-2">
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  items={units?.map((u) => ({ value: u.id, label: `${u.name} (${u.abbreviation})` })) ?? []}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="UND" />
                  </SelectTrigger>
                  <SelectContent>
                    {units?.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.abbreviation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <QuickCreateButton
                  label="unidad"
                  fields={[
                    { label: 'Nombre', required: true },
                    { label: 'Abreviatura', required: true },
                  ]}
                  onSave={([name, abbr]) => handleQuickCreate(createUnit, 'unitOfMeasureId', name, abbr)}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stockMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock mínimo</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stockMax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock máximo</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}
