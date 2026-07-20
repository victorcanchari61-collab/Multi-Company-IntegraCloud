import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ApiError } from '@/lib/api'
import { useChangePassword } from '../queries/useUsers'
import type { User } from '../types/iam'

interface Props {
  companyId: string
  user: User | null
  onClose: () => void
}

export function ChangePasswordDialog({ companyId, user, onClose }: Props) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const changePwd = useChangePassword(companyId)

  const onSubmit = () => {
    if (!user || !newPassword) return
    if (newPassword !== confirmPassword) {
      toast.error('Las contrase\u00f1as no coinciden')
      return
    }
    if (newPassword.length < 8) {
      toast.error('M\u00ednimo 8 caracteres')
      return
    }
    changePwd.mutate(
      {
        userId: user.id,
        data: { currentPassword: '', newPassword },
      },
      {
        onSuccess: () => {
          toast.success('Contrase\u00f1a actualizada')
          setNewPassword('')
          setConfirmPassword('')
          onClose()
        },
        onError: (error) =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudo cambiar la contrase\u00f1a'),
      },
    )
  }

  return (
    <Dialog open={user !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar contrase\u00f1a</DialogTitle>
          <DialogDescription>
            {user?.fullName} &mdash; {user?.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nueva contrase\u00f1a</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="M\u00ednimo 8 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirmar contrase\u00f1a</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contrase\u00f1a"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={changePwd.isPending || !newPassword}>
            {changePwd.isPending ? 'Cambiando\u2026' : 'Cambiar contrase\u00f1a'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
