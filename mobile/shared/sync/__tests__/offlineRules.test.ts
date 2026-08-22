import { describe, expect, it, jest } from '@jest/globals'
import { RULES } from '../offlineInterceptor'

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// Regresion del orden de RULES (feature 47): la regex de potrero tambien
// matchea /ganaderia/potreros/alertas, por eso la regla de alertas va primero.
describe('reglas del outbox offline', () => {
  const labelFor = (url: string) => RULES.find((rule) => rule.pattern.test(url))?.label

  it('resuelve /ganaderia/potreros/alertas a la regla de alertas', () => {
    expect(labelFor('/ganaderia/potreros/alertas')).toBe('Alerta de potrero')
  })

  it('resuelve /ganaderia/potreros/abc-123 a la regla de potrero', () => {
    expect(labelFor('/ganaderia/potreros/abc-123')).toBe('Potrero')
  })

  it('resuelve /ganaderia/potreros (creacion) a la regla de potrero', () => {
    expect(labelFor('/ganaderia/potreros')).toBe('Potrero')
  })

  // Feature 58: ordenes de aplicacion offline (alta, edicion y acciones).
  it('resuelve el alta de orden de aplicacion', () => {
    expect(labelFor('/agricola/plagas/ordenes')).toBe('Orden de aplicación')
  })

  it('resuelve la edicion de una orden de aplicacion', () => {
    expect(labelFor('/agricola/plagas/ordenes/abc-123')).toBe('Orden de aplicación')
  })

  it('resuelve aceptar/validar/rechazar de una orden de aplicacion', () => {
    expect(labelFor('/agricola/plagas/ordenes/abc-123/aceptar')).toBe('Orden de aplicación')
    expect(labelFor('/agricola/plagas/ordenes/abc-123/validar')).toBe('Orden de aplicación')
    expect(labelFor('/agricola/plagas/ordenes/abc-123/rechazar')).toBe('Orden de aplicación')
  })
})
