import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface ConfirmOptions {
  title: string
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  /** 'destructive' pinta el botón de confirmar en rojo (desactivar, anular, eliminar). */
  variant?: 'default' | 'destructive'
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/**
 * Devuelve una función `confirm(opts)` que abre el diálogo y resuelve a true/false.
 *   if (await confirm({ title: 'Desactivar usuario', variant: 'destructive' })) { ... }
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>')
  return ctx
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = (value: boolean) => {
    setOpen(false)
    resolver.current?.(value)
    resolver.current = null
  }

  const isDestructive = options?.variant === 'destructive'

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={open} onOpenChange={(o) => !o && settle(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{options?.title}</DialogTitle>
            {options?.description && (
              <DialogDescription>{options.description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => settle(false)}>
              {options?.cancelText ?? 'Cancelar'}
            </Button>
            <Button
              variant={isDestructive ? 'destructive' : 'default'}
              onClick={() => settle(true)}
            >
              {options?.confirmText ?? 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  )
}
