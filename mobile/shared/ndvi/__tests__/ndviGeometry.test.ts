import { describe, expect, it } from '@jest/globals'
import { findLoteForNdvi, polygonToNdviBounds } from '../ndviGeometry'
import type { Lote } from '../../types/agricola'

describe('polygonToNdviBounds', () => {
  it('returns native and MapLibre corners in georeferenced order', () => {
    const polygon = [
      { latitude: -37.35, longitude: -59.18 },
      { latitude: -37.33, longitude: -59.18 },
      { latitude: -37.33, longitude: -59.15 },
      { latitude: -37.35, longitude: -59.15 },
    ]

    expect(polygonToNdviBounds(polygon)).toEqual({
      northWest: { latitude: -37.33, longitude: -59.18 },
      northEast: { latitude: -37.33, longitude: -59.15 },
      southEast: { latitude: -37.35, longitude: -59.15 },
      southWest: { latitude: -37.35, longitude: -59.18 },
    })
  })

  it('rejects an empty polygon', () => {
    expect(() => polygonToNdviBounds([])).toThrow('El lote no tiene un poligono valido')
  })

  it('selects the lot from the synchronized offline replica', () => {
    const lotes = [{ id: 'north', nombre: 'Norte' }, { id: 'south', nombre: 'Sur' }] as Lote[]

    expect(findLoteForNdvi(lotes, 'south')?.nombre).toBe('Sur')
    expect(findLoteForNdvi(lotes, 'missing')).toBeNull()
  })
})
