import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUnit, getUnits, setUnitStatus, updateUnit } from '../services/units.service'
import type { UnitOfMeasureRequest } from '../types/erp'

export const unitKeys = {
  all: ['erp', 'units'] as const,
}

export const useUnits = () =>
  useQuery({
    queryKey: unitKeys.all,
    queryFn: getUnits,
  })

export function useCreateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: unitKeys.all }),
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitOfMeasureRequest }) => updateUnit(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: unitKeys.all }),
  })
}

export function useSetUnitStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setUnitStatus(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: unitKeys.all }),
  })
}
