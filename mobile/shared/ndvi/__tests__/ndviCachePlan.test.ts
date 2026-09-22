import { describe, expect, it } from '@jest/globals'
import { buildNdviCachePlan } from '../ndviCachePlan'

describe('buildNdviCachePlan', () => {
  it('downloads only new or version-changed available images', () => {
    const plan = buildNdviCachePlan(
      [
        { loteId: '1', loteNombre: 'Norte', disponible: true, generadoAt: '2026-09-20T10:00:00Z', version: 'v2', imagenUrl: '/1' },
        { loteId: '2', loteNombre: 'Sur', disponible: true, generadoAt: '2026-09-19T10:00:00Z', version: 'v1', imagenUrl: '/2' },
        { loteId: '3', loteNombre: 'Este', disponible: false, generadoAt: null, version: null, imagenUrl: null },
      ],
      {
        '1': { loteId: '1', loteNombre: 'Norte', generadoAt: '2026-09-18T10:00:00Z', version: 'v1', localUri: 'file://1.png' },
        '2': { loteId: '2', loteNombre: 'Sur', generadoAt: '2026-09-19T10:00:00Z', version: 'v1', localUri: 'file://2.png' },
        old: { loteId: 'old', loteNombre: 'Viejo', generadoAt: '2026-08-01T10:00:00Z', version: 'v1', localUri: 'file://old.png' },
      }
    )

    expect(plan.downloads.map((item) => item.loteId)).toEqual(['1'])
    expect(plan.removals.map((item) => item.loteId)).toEqual(['old'])
    expect(plan.retained.map((item) => item.loteId)).toEqual(['2'])
  })
})

