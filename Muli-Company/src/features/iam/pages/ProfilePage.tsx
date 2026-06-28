import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiError } from '@/lib/api'
import { Badge } from '@/components/ui/badge'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'La contrase\u00f1a actual es requerida'),
    newPassword: z.string().min(8, 'M\u00ednimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma la contrase\u00f1a'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contrase\u00f1as no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const [saving, setSaving] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Contrase\u00f1a actualizada')
      form.reset()
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'No se pudo cambiar la contrase\u00f1a',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Informaci&oacute;n de tu cuenta y seguridad.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informaci&oacute;n personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nombre</span>
            <span className="font-medium">{user.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Correo</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rol</span>
            <Badge variant="outline">{user.isOwner ? 'Propietario' : 'Usuario'}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Roles del sistema</span>
            <span>{user.roles.length > 0 ? user.roles.join(', ') : '\u2014'}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar contrase&ntilde;a</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contrase&ntilde;a actual</Label>
              <Input
                id="currentPassword"
                type="password"
                {...form.register('currentPassword')}
              />
              {form.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contrase&ntilde;a</Label>
              <Input id="newPassword" type="password" {...form.register('newPassword')} />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contrase&ntilde;a</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Cambiando\u2026' : 'Cambiar contrase\u00f1a'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
