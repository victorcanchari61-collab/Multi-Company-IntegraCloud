import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useProducts } from '../queries/useProducts'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Product } from '../types/erp'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (product: Product) => void
}

export function ProductSearchDialog({ open, onOpenChange, onSelect }: Props) {
  const { data: products, isLoading } = useProducts()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!products) return []
    const q = search.toLowerCase().trim()
    if (!q) return products
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    )
  }, [products, search])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Buscar producto complementario</DialogTitle>
          <DialogDescription>
            Selecciona un producto del catálogo para asociarlo como complementario.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, SKU o código de barra..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="overflow-auto max-h-[50vh] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead className="text-right">Precio venta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {search ? 'No se encontraron productos' : 'No hay productos disponibles'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      onSelect(product)
                      onOpenChange(false)
                    }}
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{product.sku ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{product.categoryName ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{product.brandName ?? '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {product.salePrice != null ? `S/ ${product.salePrice.toFixed(2)}` : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
