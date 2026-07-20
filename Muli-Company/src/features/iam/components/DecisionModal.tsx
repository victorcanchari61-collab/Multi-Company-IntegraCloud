import { useState } from 'react'

interface DecisionModalProps {
  open: boolean
  title: string
  description: string
  onConfirm: (comment?: string) => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
}

export function DecisionModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}: DecisionModalProps) {
  const [comment, setComment] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mb-4 text-sm text-gray-600">{description}</p>

        <div className="mb-4">
          <label
            htmlFor="decision-comment"
            className="mb-1 block text-xs font-medium text-gray-700"
          >
            Comentario (opcional)
          </label>
          <textarea
            id="decision-comment"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Motivo de la decisión..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(comment || undefined)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
