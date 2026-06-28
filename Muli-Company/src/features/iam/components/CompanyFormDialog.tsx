import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ImageIcon, Loader2, Plus, Search, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ApiError } from '@/lib/api'
import { lookupRuc } from '@/lib/lookup'
import { useCreateCompany, useUpdateCompany } from '../queries/useCompanies'
import type { Company } from '../types/iam'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(150),
  slug: z
    .string()
    .min(1, 'El subdominio es requerido')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  legalName: z.string().max(200).optional(),
  /** Imagen del logo en data URL (base64). */
  logoUrl: z.string().optional(),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  address: z.string().max(300).optional(),
  taxId: z.string().max(20).optional(),
  taxAddress: z.string().max(300).optional(),
  economicActivity: z.string().max(255).optional(),
  taxpayerType: z.number().int().min(1).max(2),
  accountingRequired: z.boolean(),
  settlementCurrency: z.string().min(3, 'Código de 3 letras').max(3),
  // Credenciales SUNAT (opcionales al registrar)
  solUser: z.string().max(60).optional(),
  solPassword: z.string().max(120).optional(),
  certificatePassword: z.string().max(120).optional(),
  certificateFileName: z.string().optional(),
  certificateContent: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const empty = (value?: string) => (value && value.trim() !== '' ? value.trim() : null)

interface Props {
  /** Si se pasa, el diálogo entra en modo edición (controlado). */
  company?: Company
  onClose?: () => void
}

export function CompanyFormDialog({ company, onClose }: Props = {}) {
  const isEdit = Boolean(company)
  const [open, setOpen] = useState(false)
  const createMut = useCreateCompany()
  const updateMut = useUpdateCompany()
  const isPending = createMut.isPending || updateMut.isPending

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: company?.name ?? '',
      slug: company?.slug ?? '',
      legalName: company?.legalName ?? '',
      logoUrl: company?.logoUrl ?? '',
      email: company?.email ?? '',
      phone: company?.phone ?? '',
      website: company?.website ?? '',
      address: company?.address ?? '',
      taxId: company?.taxId ?? '',
      taxAddress: company?.taxAddress ?? '',
      economicActivity: company?.economicActivity ?? '',
      taxpayerType: company?.taxpayerType ?? 2,
      accountingRequired: company?.accountingRequired ?? false,
      settlementCurrency: company?.settlementCurrency ?? 'PEN',
      solUser: '',
      solPassword: '',
      certificatePassword: '',
      certificateFileName: '',
      certificateContent: '',
    },
  })

  const certInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const certFileName = form.watch('certificateFileName')
  const logoUrl = form.watch('logoUrl')
  const [rucLoading, setRucLoading] = useState(false)

  const onBuscarRuc = async () => {
    const ruc = form.getValues('taxId')?.trim()
    if (!ruc) {
      toast.error('Ingresa un RUC para consultar')
      return
    }
    setRucLoading(true)
    try {
      const data = await lookupRuc(ruc)
      form.setValue('legalName', data.razonSocial)
      if (!form.getValues('name')?.trim())
        form.setValue('name', data.nombreComercial || data.razonSocial)
      if (data.direccion) form.setValue('taxAddress', data.direccion)
      toast.success('Datos del RUC cargados')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo consultar el RUC')
    } finally {
      setRucLoading(false)
    }
  }

  const onCertificateFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.includes(',') ? result.split(',')[1] : result
      form.setValue('certificateContent', base64)
      form.setValue('certificateFileName', file.name)
    }
    reader.readAsDataURL(file)
  }

  const onLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    // Guardamos el data URL completo para previsualizar y mostrar el logo.
    reader.onload = () => form.setValue('logoUrl', reader.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = (data: FormData) => {
    // Campos de perfil compartidos por crear y editar (el subdominio no se edita).
    const profile = {
      name: data.name,
      legalName: empty(data.legalName),
      logoUrl: empty(data.logoUrl),
      email: empty(data.email),
      phone: empty(data.phone),
      website: empty(data.website),
      address: empty(data.address),
      taxId: empty(data.taxId),
      taxAddress: empty(data.taxAddress),
      economicActivity: empty(data.economicActivity),
      taxpayerType: data.taxpayerType,
      accountingRequired: data.accountingRequired,
      settlementCurrency: data.settlementCurrency,
    }

    if (isEdit && company) {
      updateMut.mutate(
        { id: company.id, data: profile },
        {
          onSuccess: () => {
            toast.success('Empresa actualizada')
            onClose?.()
          },
          onError: (error) =>
            toast.error(
              error instanceof ApiError ? error.message : 'No se pudo actualizar la empresa',
            ),
        },
      )
      return
    }

    createMut.mutate(
      {
        ...profile,
        slug: data.slug,
        solUser: empty(data.solUser),
        solPassword: empty(data.solPassword),
        certificatePassword: empty(data.certificatePassword),
        certificateFileName: empty(data.certificateFileName),
        certificateContent: empty(data.certificateContent),
      },
      {
        onSuccess: () => {
          toast.success('Empresa creada')
          form.reset()
          setOpen(false)
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudo crear la empresa'),
      },
    )
  }

  return (
    <>
      {!isEdit && (
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Nueva empresa
        </Button>
      )}
      <Dialog
        open={isEdit ? true : open}
        onOpenChange={isEdit ? (o) => !o && onClose?.() : setOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar empresa' : 'Nueva empresa'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Actualiza los datos de la empresa.'
                : 'Registra una empresa (tenant) en la plataforma.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <Tabs defaultValue="generales">
                <TabsList className="w-full">
                  <TabsTrigger value="generales">Generales</TabsTrigger>
                  <TabsTrigger value="facturacion">Facturación</TabsTrigger>
                  {!isEdit && <TabsTrigger value="certificado">Certificado</TabsTrigger>}
                  <TabsTrigger value="branding">Branding</TabsTrigger>
                </TabsList>

                <div className="-mx-1 max-h-[60vh] overflow-y-auto px-1 pt-2 pb-1">
                  {/* ── Generales ── */}
                  <TabsContent value="generales" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre comercial</FormLabel>
                          <FormControl>
                            <Input placeholder="Mi Empresa S.A.C." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subdominio</FormLabel>
                            <FormControl>
                              <Input placeholder="mi-empresa" disabled={isEdit} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="legalName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Razón social <span className="text-muted-foreground">(opcional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Mi Empresa Sociedad Anónima Cerrada" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Correo <span className="text-muted-foreground">(opcional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="contacto@empresa.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Teléfono <span className="text-muted-foreground">(opcional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+51 999 999 999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Sitio web <span className="text-muted-foreground">(opcional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://miempresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Dirección <span className="text-muted-foreground">(opcional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Av. Siempre Viva 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* ── Facturación electrónica (SUNAT) ── */}
                  <TabsContent value="facturacion" className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RUC</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input placeholder="20123456789" {...field} />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-9 shrink-0"
                                  onClick={onBuscarRuc}
                                  disabled={rucLoading}
                                  title="Consultar en SUNAT"
                                >
                                  {rucLoading ? (
                                    <Loader2 className="size-4 animate-spin text-primary" />
                                  ) : (
                                    <Search className="size-4 text-primary" />
                                  )}
                                  <span className="sr-only">Consultar RUC</span>
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="taxpayerType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de contribuyente</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                value={field.value}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              >
                                <option value={2}>Persona jurídica</option>
                                <option value={1}>Persona natural</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="taxAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Domicilio fiscal{' '}
                            <span className="text-muted-foreground">(opcional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Dirección registrada en SUNAT" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="economicActivity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Actividad económica{' '}
                              <span className="text-muted-foreground">(opcional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Comercio al por menor" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="settlementCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Moneda</FormLabel>
                            <FormControl>
                              <Input maxLength={3} placeholder="PEN" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="accountingRequired"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="accountingRequired"
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                            />
                            <Label htmlFor="accountingRequired" className="font-normal">
                              Obligada a llevar contabilidad
                            </Label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* ── Certificado SUNAT ── */}
                  {!isEdit && (
                  <TabsContent value="certificado" className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Credenciales para emitir comprobantes electrónicos. Se almacenan cifradas.
                      Puedes dejarlas vacías y configurarlas después.
                    </p>
                    <FormField
                      control={form.control}
                      name="certificateFileName"
                      render={() => (
                        <FormItem>
                          <FormLabel>Certificado digital (.pem / .pfx)</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => certInputRef.current?.click()}
                              >
                                <Upload className="size-4" /> Subir archivo
                              </Button>
                              <span className="truncate text-sm text-muted-foreground">
                                {certFileName || 'Ningún archivo seleccionado'}
                              </span>
                              <input
                                ref={certInputRef}
                                type="file"
                                accept=".pem,.pfx,.p12"
                                className="hidden"
                                onChange={onCertificateFile}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="certificatePassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Clave del certificado{' '}
                            <span className="text-muted-foreground">(opcional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="solUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario SOL</FormLabel>
                            <FormControl>
                              <Input placeholder="USUARIO01" autoComplete="off" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="solPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clave SOL</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  )}

                  {/* ── Branding ── */}
                  <TabsContent value="branding" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={() => (
                        <FormItem>
                          <FormLabel>
                            Logo <span className="text-muted-foreground">(opcional)</span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                                {logoUrl ? (
                                  <img
                                    src={logoUrl}
                                    alt="Logo"
                                    className="size-full object-contain"
                                  />
                                ) : (
                                  <ImageIcon className="size-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => logoInputRef.current?.click()}
                                  >
                                    <Upload className="size-4" /> Subir imagen
                                  </Button>
                                  {logoUrl && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => form.setValue('logoUrl', '')}
                                    >
                                      Quitar
                                    </Button>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  PNG, JPG o SVG.
                                </span>
                              </div>
                              <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                className="hidden"
                                onChange={onLogoFile}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter>
                {isEdit && (
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? isEdit
                      ? 'Guardando…'
                      : 'Creando…'
                    : isEdit
                      ? 'Guardar cambios'
                      : 'Crear empresa'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
