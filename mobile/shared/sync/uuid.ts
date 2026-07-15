// UUID v4 sin dependencias nativas: alcanza para claves de idempotencia e IDs
// temporales del outbox (colision practicamente imposible a esta escala).
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}
