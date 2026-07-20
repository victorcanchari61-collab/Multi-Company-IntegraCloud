import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ApiError } from '@/lib/api'
import { ROUTES, STORAGE_KEYS } from '@/lib/constants'
import { useLogin } from '../queries/useAuth'

const schema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  slug: z.string().optional(),
})

type LoginFormData = z.infer<typeof schema>

interface Props {
  /** Muestra el campo de empresa (slug). El dueño del sistema no lo necesita. */
  showCompany?: boolean
  /** Fija la empresa (desde el subdominio); oculta el campo y la usa al iniciar sesión. */
  companySlug?: string
}

const rememberedEmail = (): string =>
  typeof window === 'undefined'
    ? ''
    : (localStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL) ?? '')

export function LoginForm({ showCompany = true, companySlug }: Props) {
  const navigate = useNavigate()
  const { mutate, isPending } = useLogin()
  const initialEmail = rememberedEmail()
  const [remember, setRemember] = useState(Boolean(initialEmail))

  const form = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: initialEmail, password: '', slug: '' },
  })

  const onSubmit = (data: LoginFormData) => {
    if (remember) localStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, data.email)
    else localStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL)

    mutate(
      { ...data, slug: companySlug ?? (data.slug?.trim() || null) },
      {
        onSuccess: () => navigate({ to: ROUTES.DASHBOARD }),
        onError: (error) =>
          toast.error(
            error instanceof ApiError ? error.message : 'No se pudo iniciar sesión',
          ),
      },
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="tu@empresa.com"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCompany && (
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Empresa <span className="text-muted-foreground">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="mi-empresa"
                    autoComplete="organization"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked === true)}
            />
            <Label htmlFor="remember" className="font-normal text-muted-foreground">
              Recordar credenciales
            </Label>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => toast.info('Contacta al administrador para restablecer tu contraseña.')}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button type="submit" className="h-11 w-full text-base" disabled={isPending}>
          {isPending ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </Form>
  )
}
