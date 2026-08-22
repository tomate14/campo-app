import { useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Check, ClipboardCheck, Plus, X } from 'lucide-react-native'
import { readCurrentUser } from '../../shared/auth/session'
import { useQuery } from '@tanstack/react-query'
import { getOperariosAsignables } from '../../shared/api/agricola'
import { useLotes } from '../../shared/hooks/useLotes'
import { useDeteccionesPlaga } from '../../shared/hooks/usePlagas'
import { useUtilidadOpciones } from '../../shared/hooks/useUtilidades'
import {
  useAceptarOrdenAplicacion,
  useCreateOrdenAplicacion,
  useOrdenesAplicacion,
  useRechazarOrdenAplicacion,
  useUpdateOrdenAplicacion,
  useValidarOrdenAplicacion,
} from '../../shared/hooks/useOrdenesAplicacion'
import type { EstadoOrdenAplicacion, OrdenAplicacion, OrdenAplicacionRequest } from '../../shared/types/agricola'

type Vista = 'asignadas' | 'creadas'
type FormState = Partial<OrdenAplicacionRequest> & { id?: string }

const ESTADO_COLOR: Record<EstadoOrdenAplicacion, string> = {
  PENDIENTE: '#FFB84D',
  ACEPTADA: '#9A7DFF',
  VALIDADA: '#6EA8FF',
  RECHAZADA: '#FF6B6B',
}

function estadoLabel(estado: EstadoOrdenAplicacion): string {
  return estado === 'ACEPTADA' ? 'Aceptada' : estado === 'VALIDADA' ? 'Validada' : estado === 'RECHAZADA' ? 'Rechazada' : 'Pendiente'
}

export default function OrdenesAplicacionScreen() {
  const params = useLocalSearchParams<{ nueva?: string; loteId?: string; deteccionId?: string }>()
  const ordenesQuery = useOrdenesAplicacion()
  const lotesQuery = useLotes()
  const deteccionesQuery = useDeteccionesPlaga()
  const operariosQuery = useQuery({ queryKey: ['operarios-asignables'], queryFn: getOperariosAsignables })
  const unidadesQuery = useUtilidadOpciones('UNIDAD_DOSIS')

  const crear = useCreateOrdenAplicacion()
  const actualizar = useUpdateOrdenAplicacion()
  const aceptar = useAceptarOrdenAplicacion()
  const validar = useValidarOrdenAplicacion()
  const rechazar = useRechazarOrdenAplicacion()

  const [userId, setUserId] = useState<string | null>(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [vista, setVista] = useState<Vista>('asignadas')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void readCurrentUser().then((user) => {
      setUserId(user?.id ?? null)
      const roles = user?.roles ?? []
      setEsAdmin(roles.includes('admin') || roles.includes('super_admin'))
    })
  }, [])

  const ordenes = ordenesQuery.data ?? []
  const lotes = lotesQuery.data ?? []
  const detecciones = deteccionesQuery.data ?? []
  // El endpoint ya devuelve solo operarios activos.
  const operarios = operariosQuery.data ?? []
  const unidades = unidadesQuery.data ?? []

  // Total de dosis a utilizar = dosis x superficie (la unidad del total quita el "/ha").
  const total = useMemo(() => {
    const dosis = Number(form.dosis)
    const sup = Number(form.superficieTratadaHa)
    if (!isFinite(dosis) || dosis <= 0 || !isFinite(sup) || sup <= 0) return null
    return { valor: Math.round(dosis * sup * 100) / 100, unidad: (form.unidadDosis ?? '').replace(/\s*\/\s*ha$/i, '').trim() }
  }, [form.dosis, form.superficieTratadaHa, form.unidadDosis])

  const miOperarioId = useMemo(() => operarios.find((o) => o.userId === userId)?.id, [operarios, userId])

  // Abre el alta si se llega desde la burbuja del mapa (?nueva=1).
  useEffect(() => {
    if (params.nueva) {
      setForm({ ...emptyForm(), loteId: params.loteId ?? '', deteccionId: params.deteccionId ?? '' })
      setModalOpen(true)
    }
  }, [params.nueva, params.loteId, params.deteccionId])

  const visibles = useMemo(() => {
    if (!miOperarioId) return ordenes
    return vista === 'asignadas'
      ? ordenes.filter((o) => o.operarioId === miOperarioId)
      : ordenes.filter((o) => o.responsableId === miOperarioId)
  }, [ordenes, vista, miOperarioId])

  const deteccionesDelLote = useMemo(
    () => detecciones.filter((d) => d.loteId === form.loteId),
    [detecciones, form.loteId],
  )

  const abrirNueva = () => {
    setForm(emptyForm())
    setError(null)
    setModalOpen(true)
  }

  const abrirEdicion = (orden: OrdenAplicacion) => {
    setForm({
      id: orden.id,
      loteId: orden.loteId,
      deteccionId: orden.deteccionId,
      producto: orden.producto,
      principioActivo: orden.principioActivo,
      dosis: orden.dosis,
      unidadDosis: orden.unidadDosis,
      superficieTratadaHa: orden.superficieTratadaHa,
      observaciones: orden.observaciones,
      operarioId: orden.operarioId,
    })
    setError(null)
    setModalOpen(true)
  }

  const guardar = () => {
    if (!form.loteId || !form.deteccionId || !form.producto || !form.unidadDosis || form.dosis == null || !form.operarioId) {
      setError('Completá lote, detección, producto, dosis, unidad y operario.')
      return
    }
    const payload: OrdenAplicacionRequest = {
      loteId: form.loteId,
      deteccionId: form.deteccionId,
      producto: form.producto,
      principioActivo: form.principioActivo,
      dosis: Number(form.dosis),
      unidadDosis: form.unidadDosis,
      superficieTratadaHa: form.superficieTratadaHa != null ? Number(form.superficieTratadaHa) : undefined,
      observaciones: form.observaciones,
      operarioId: form.operarioId,
    }
    const done = () => { setModalOpen(false); setForm(emptyForm()) }
    if (form.id) {
      actualizar.mutate({ id: form.id, data: payload }, { onSuccess: done, onError: () => setError('No se pudo guardar la orden.') })
    } else {
      crear.mutate(payload, { onSuccess: done, onError: () => setError('No se pudo guardar la orden.') })
    }
  }

  const soyOperario = (orden: OrdenAplicacion) => !!miOperarioId && orden.operarioId === miOperarioId
  const soyResponsable = (orden: OrdenAplicacion) => !!miOperarioId && orden.responsableId === miOperarioId

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerIcon}><ClipboardCheck size={20} color="#FFB84D" strokeWidth={2.2} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Órdenes de aplicación</Text>
          <Text style={styles.subtitle}>Asigná una orden a un operario; al aceptarla se registra la aplicación.</Text>
        </View>
        <Pressable style={styles.newButton} onPress={abrirNueva}>
          <Plus size={18} color="#06210a" strokeWidth={2.6} />
        </Pressable>
      </View>

      <View style={styles.toggleRow}>
        <Pressable style={[styles.toggle, vista === 'asignadas' && styles.toggleActive]} onPress={() => setVista('asignadas')}>
          <Text style={[styles.toggleText, vista === 'asignadas' && styles.toggleTextActive]}>Asignadas a mí</Text>
        </Pressable>
        <Pressable style={[styles.toggle, vista === 'creadas' && styles.toggleActive]} onPress={() => setVista('creadas')}>
          <Text style={[styles.toggleText, vista === 'creadas' && styles.toggleTextActive]}>Creadas por mí</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {ordenesQuery.isLoading && <Text style={styles.muted}>Cargando órdenes...</Text>}
        {!ordenesQuery.isLoading && !visibles.length && <Text style={styles.muted}>No hay órdenes para mostrar.</Text>}

        {visibles.map((orden) => (
          <View key={orden.id} style={styles.card}>
            <View style={[styles.cardBand, { backgroundColor: ESTADO_COLOR[orden.estado] }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.cardNumero}>#{orden.numero ?? '—'}</Text>
                <View style={[styles.estadoBadge, { borderColor: `${ESTADO_COLOR[orden.estado]}55`, backgroundColor: `${ESTADO_COLOR[orden.estado]}18` }]}>
                  <Text style={[styles.estadoText, { color: ESTADO_COLOR[orden.estado] }]}>{estadoLabel(orden.estado)}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{orden.producto}</Text>
              <Text style={styles.cardMeta}>{orden.loteNombre} · {orden.plagaNombre}</Text>
              <Text style={styles.cardMeta}>{orden.dosis} {orden.unidadDosis}{orden.superficieTratadaHa ? ` · ${orden.superficieTratadaHa} ha` : ''}</Text>
              <Text style={styles.cardMeta}>Resp. {orden.responsableNombre || '—'} · Operario {orden.operarioNombre || '—'}</Text>
              {orden.estado === 'RECHAZADA' && !!orden.motivoRechazo && (
                <Text style={styles.cardRechazo}>Motivo: {orden.motivoRechazo}</Text>
              )}

              {orden.estado === 'PENDIENTE' && (
                <View style={styles.cardActions}>
                  {soyOperario(orden) && (
                    <>
                      <Pressable style={[styles.action, styles.actionOk]} onPress={() => aceptar.mutate(orden.id)}>
                        <Check size={14} color="#9FE870" strokeWidth={2.6} />
                        <Text style={[styles.actionText, { color: '#9FE870' }]}>Aceptar</Text>
                      </Pressable>
                      <Pressable style={[styles.action, styles.actionDanger]} onPress={() => rechazar.mutate({ id: orden.id })}>
                        <X size={14} color="#FF8A8A" strokeWidth={2.6} />
                        <Text style={[styles.actionText, { color: '#FF8A8A' }]}>Rechazar</Text>
                      </Pressable>
                    </>
                  )}
                  {soyResponsable(orden) && (
                    <Pressable style={styles.action} onPress={() => abrirEdicion(orden)}>
                      <Text style={styles.actionText}>Editar</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Aceptada por el operario: el responsable o un admin la valida -> genera la aplicacion. */}
              {orden.estado === 'ACEPTADA' && (soyResponsable(orden) || esAdmin) && (
                <View style={styles.cardActions}>
                  <Pressable style={[styles.action, styles.actionOk]} onPress={() => validar.mutate(orden.id)}>
                    <Check size={14} color="#9FE870" strokeWidth={2.6} />
                    <Text style={[styles.actionText, { color: '#9FE870' }]}>Validar</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>{form.id ? 'Editar orden' : 'Nueva orden de aplicación'}</Text>
              <Pressable onPress={() => setModalOpen(false)}><X size={20} color="#DCE8F8" /></Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
              {!!error && <Text style={styles.error}>{error}</Text>}

              <Text style={styles.label}>Lote</Text>
              <ChipRow
                options={lotes.map((l) => ({ id: l.id, label: l.nombre }))}
                selected={form.loteId}
                onSelect={(id) => setForm((f) => ({ ...f, loteId: id, deteccionId: '' }))}
              />

              <Text style={styles.label}>Detección</Text>
              <ChipRow
                options={deteccionesDelLote.map((d) => ({ id: d.id, label: `${d.plagaNombre} · ${d.severidad}` }))}
                selected={form.deteccionId}
                onSelect={(id) => setForm((f) => ({ ...f, deteccionId: id }))}
                emptyLabel="Elegí un lote primero"
              />

              <Text style={styles.label}>Operario asignado</Text>
              <ChipRow
                options={operarios.map((o) => ({ id: o.id, label: `${o.nombre} ${o.apellido}` }))}
                selected={form.operarioId}
                onSelect={(id) => setForm((f) => ({ ...f, operarioId: id }))}
              />

              <Text style={styles.label}>Producto</Text>
              <TextInput style={styles.input} value={form.producto ?? ''} onChangeText={(v) => setForm((f) => ({ ...f, producto: v }))} placeholder="Producto" placeholderTextColor="#5E6B85" />

              <Text style={styles.label}>Principio activo</Text>
              <TextInput style={styles.input} value={form.principioActivo ?? ''} onChangeText={(v) => setForm((f) => ({ ...f, principioActivo: v }))} placeholder="Opcional" placeholderTextColor="#5E6B85" />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Dosis</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={form.dosis != null ? String(form.dosis) : ''} onChangeText={(v) => setForm((f) => ({ ...f, dosis: v === '' ? undefined : Number(v) }))} placeholder="0" placeholderTextColor="#5E6B85" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Superficie (ha)</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={form.superficieTratadaHa != null ? String(form.superficieTratadaHa) : ''} onChangeText={(v) => setForm((f) => ({ ...f, superficieTratadaHa: v === '' ? undefined : Number(v) }))} placeholder="0" placeholderTextColor="#5E6B85" />
                </View>
              </View>

              <Text style={styles.label}>Unidad</Text>
              <ChipRow
                options={unidades.map((u) => ({ id: u.valor, label: u.valor }))}
                selected={form.unidadDosis}
                onSelect={(id) => setForm((f) => ({ ...f, unidadDosis: id }))}
                emptyLabel="Sin unidades cargadas"
              />

              {!!total && (
                <View style={styles.totalBox}>
                  <Text style={styles.totalLabel}>Total de dosis a utilizar</Text>
                  <Text style={styles.totalValue}>{total.valor} {total.unidad}</Text>
                </View>
              )}

              <Text style={styles.label}>Observaciones</Text>
              <TextInput style={[styles.input, styles.textarea]} multiline value={form.observaciones ?? ''} onChangeText={(v) => setForm((f) => ({ ...f, observaciones: v }))} placeholder="Opcional" placeholderTextColor="#5E6B85" />

              <Pressable style={styles.saveButton} disabled={crear.isPending || actualizar.isPending} onPress={guardar}>
                <Text style={styles.saveButtonText}>{crear.isPending || actualizar.isPending ? 'Guardando...' : 'Guardar orden'}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function ChipRow({ options, selected, onSelect, emptyLabel }: { options: Array<{ id: string; label: string }>; selected?: string; onSelect: (id: string) => void; emptyLabel?: string }) {
  if (!options.length) {
    return <Text style={styles.chipEmpty}>{emptyLabel ?? 'Sin opciones'}</Text>
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {options.map((opt) => (
        <Pressable key={opt.id} style={[styles.chip, selected === opt.id && styles.chipActive]} onPress={() => onSelect(opt.id)}>
          <Text style={[styles.chipText, selected === opt.id && styles.chipTextActive]}>{opt.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}

function emptyForm(): FormState {
  return { loteId: '', deteccionId: '', producto: '', dosis: undefined, unidadDosis: 'l/ha', operarioId: '' }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050B18' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12 },
  headerIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,184,77,0.12)', borderWidth: 1, borderColor: 'rgba(255,184,77,0.28)' },
  title: { color: '#F8FBFF', fontSize: 18, fontWeight: '900' },
  subtitle: { color: '#9BB0CC', fontSize: 12, marginTop: 2 },
  newButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9FE870' },
  toggleRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  toggle: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(11,23,48,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  toggleActive: { backgroundColor: 'rgba(159,232,112,0.12)', borderColor: 'rgba(159,232,112,0.3)' },
  toggleText: { color: '#9BB0CC', fontSize: 12, fontWeight: '700' },
  toggleTextActive: { color: '#9FE870' },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  muted: { color: '#7E8BAA', fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  card: { flexDirection: 'row', borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(11,23,48,0.68)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  cardBand: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardNumero: { color: '#F8FBFF', fontSize: 13, fontWeight: '900' },
  estadoBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  estadoText: { fontSize: 10, fontWeight: '800' },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginTop: 6 },
  cardMeta: { color: '#A6B0CF', fontSize: 12, marginTop: 2 },
  cardRechazo: { color: '#FF8A8A', fontSize: 12, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: 'rgba(148,163,184,0.1)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
  actionOk: { backgroundColor: 'rgba(159,232,112,0.1)', borderColor: 'rgba(159,232,112,0.3)' },
  actionDanger: { backgroundColor: 'rgba(255,107,107,0.1)', borderColor: 'rgba(255,107,107,0.3)' },
  actionText: { color: '#DCE8F8', fontSize: 12, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(2,6,16,0.7)', justifyContent: 'flex-end' },
  modalPanel: { maxHeight: '90%', backgroundColor: '#081225', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: 'rgba(159,232,112,0.18)', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 24 },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { color: '#F8FBFF', fontSize: 17, fontWeight: '900' },
  formScroll: { paddingBottom: 20, gap: 4 },
  error: { color: '#FCA5A5', fontSize: 12, marginBottom: 8 },
  label: { color: '#9BB0CC', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: 'rgba(8,18,37,0.7)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.18)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#F8FBFF', fontSize: 14 },
  textarea: { minHeight: 70, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(11,23,48,0.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipActive: { backgroundColor: 'rgba(159,232,112,0.14)', borderColor: 'rgba(159,232,112,0.34)' },
  chipText: { color: '#A6B0CF', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#9FE870' },
  chipEmpty: { color: '#7E8BAA', fontSize: 12, fontStyle: 'italic', paddingVertical: 6 },
  totalBox: { marginTop: 14, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,184,77,0.28)', backgroundColor: 'rgba(255,184,77,0.08)' },
  totalLabel: { color: '#9BB0CC', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  totalValue: { color: '#FFD166', fontSize: 18, fontWeight: '900', marginTop: 2 },
  saveButton: { marginTop: 20, backgroundColor: '#9FE870', borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  saveButtonText: { color: '#06210a', fontSize: 14, fontWeight: '900' },
})
