import { isAxiosError } from 'axios'
import type { QueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { listOutbox, patchOutboxItem, removeOutboxItem, replaceTempIdInOutbox } from './outbox'

let draining = false

// Drena el outbox FIFO contra los endpoints REST existentes.
// - 2xx: saca el item, remapea el tempId en los pendientes que lo referencian.
// - Error de red / 5xx / 401: corta el drenado (se reintenta en la proxima señal).
// - 4xx de validacion: marca el item como ERROR (bandeja) y sigue con el resto.
export async function drainOutbox(queryClient?: QueryClient): Promise<{ sent: number; halted: boolean }> {
  if (draining) return { sent: 0, halted: false }
  draining = true

  let sent = 0
  let halted = false
  const failedThisRound = new Set<string>()

  try {
    // Se relee la cola en cada vuelta porque el remap de tempIds puede reescribir payloads.
    for (;;) {
      const items = await listOutbox()
      const next = items.find((item) => item.status === 'PENDIENTE' && !failedThisRound.has(item.opId))
      if (!next) break

      try {
        const response = await apiClient.request<{ data?: { id?: string } }>({
          method: next.method,
          url: next.url,
          data: next.payload,
          headers: { 'Idempotency-Key': next.opId },
          skipOutbox: true,
        })
        const realId = response.data?.data?.id
        if (next.tempId && realId) {
          await replaceTempIdInOutbox(next.tempId, realId)
        }
        await removeOutboxItem(next.opId)
        sent += 1
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined
        // 401/403 son problemas de sesion (token vencido), no de datos: pausan
        // la cola en vez de mandar el item a la bandeja de errores.
        const isValidationError = status !== undefined && status >= 400 && status < 500 && status !== 401 && status !== 403
        if (isValidationError) {
          await patchOutboxItem(next.opId, {
            status: 'ERROR',
            errorMessage: extractErrorMessage(error),
            attempts: next.attempts + 1,
          })
          failedThisRound.add(next.opId)
        } else {
          // Sin red, servidor caido o token vencido: no tiene sentido seguir drenando.
          await patchOutboxItem(next.opId, { attempts: next.attempts + 1 })
          halted = true
          break
        }
      }
    }

    if (sent > 0 && queryClient) {
      await queryClient.invalidateQueries()
    }
  } finally {
    draining = false
  }

  return { sent, halted }
}

export async function retryOutboxItem(opId: string, queryClient?: QueryClient) {
  await patchOutboxItem(opId, { status: 'PENDIENTE', errorMessage: undefined })
  return drainOutbox(queryClient)
}

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as { error?: string; message?: string } | undefined
    return body?.error ?? body?.message ?? `Error ${error.response?.status ?? 'desconocido'}`
  }
  return 'Error desconocido'
}
