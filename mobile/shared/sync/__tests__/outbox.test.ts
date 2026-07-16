import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  enqueueOutbox,
  listOutbox,
  outboxCounts,
  patchOutboxItem,
  removeOutboxItem,
  replaceTempIdInOutbox,
} from '../outbox'

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

describe('outbox', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
    // La cache en memoria del modulo se resetea vaciando la cola persistida.
    for (const item of await listOutbox()) {
      await removeOutboxItem(item.opId)
    }
  })

  it('encola items como PENDIENTE en orden FIFO', async () => {
    await enqueueOutbox({ opId: 'op-1', method: 'post', url: '/ganaderia/sanidad/pesajes', payload: { pesoKg: 300 }, entityLabel: 'Pesaje' })
    await enqueueOutbox({ opId: 'op-2', method: 'post', url: '/ganaderia/reproduccion/partos', payload: {}, entityLabel: 'Parto' })

    const items = await listOutbox()
    expect(items.map((item) => item.opId)).toEqual(['op-1', 'op-2'])
    expect(items[0].status).toBe('PENDIENTE')
    expect(items[0].attempts).toBe(0)
  })

  it('reescribe el tempId en payloads y URLs de los items pendientes', async () => {
    await enqueueOutbox({
      opId: 'op-parto',
      method: 'post',
      url: '/ganaderia/reproduccion/partos',
      payload: { madreId: 'real-1', terneroId: 'temp-abc' },
      entityLabel: 'Parto',
    })
    await enqueueOutbox({
      opId: 'op-seguimiento',
      method: 'post',
      url: '/agricola/plagas/detecciones/temp-abc/seguimientos',
      payload: { nota: 'x' },
      entityLabel: 'Seguimiento de plaga',
    })

    await replaceTempIdInOutbox('temp-abc', 'server-99')

    const items = await listOutbox()
    expect((items[0].payload as { terneroId: string }).terneroId).toBe('server-99')
    expect(items[1].url).toBe('/agricola/plagas/detecciones/server-99/seguimientos')
  })

  it('cuenta pendientes y errores por separado', async () => {
    await enqueueOutbox({ opId: 'op-a', method: 'post', url: '/x', payload: {}, entityLabel: 'A' })
    await enqueueOutbox({ opId: 'op-b', method: 'post', url: '/y', payload: {}, entityLabel: 'B' })
    await patchOutboxItem('op-b', { status: 'ERROR', errorMessage: 'caravana duplicada' })

    const counts = await outboxCounts()
    expect(counts).toEqual({ pending: 1, errors: 1 })

    const error = (await listOutbox()).find((item) => item.opId === 'op-b')
    expect(error?.errorMessage).toBe('caravana duplicada')
  })

  it('remueve items sincronizados', async () => {
    await enqueueOutbox({ opId: 'op-1', method: 'post', url: '/x', payload: {}, entityLabel: 'A' })
    await removeOutboxItem('op-1')
    expect(await listOutbox()).toHaveLength(0)
  })
})
