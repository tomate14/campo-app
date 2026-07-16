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
})
