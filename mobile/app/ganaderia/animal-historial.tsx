import { useMemo } from 'react'
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  CalendarDays,
  ClipboardList,
  Pill,
  Scale,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from 'lucide-react-native'
import { useAnimalHistorial, type HistorialTipo } from '../../shared/hooks/useAnimalHistorial'
import { usePotrerosList } from '../../shared/hooks/usePotreros'
import { formatDateDisplay } from '../../shared/components/ganaderia-form-kit'
import type {
  AplicacionVacunaResponse,
  DiagnosticoSanitarioResponse,
  HistorialMedicoAnimalResponse,
  MovimientoAnimalResponse,
  PesajeResponse,
  TratamientoMedicamentoResponse,
} from '../../shared/types/ganaderia'

const TIPOS: HistorialTipo[] = ['CLINICO', 'PESOS', 'MOVIMIENTOS', 'VACUNAS', 'TRATAMIENTOS', 'DIAGNOSTICOS']

const tipoConfig: Record<HistorialTipo, { title: string; Icon: LucideIcon; color: string }> = {
  CLINICO: { title: 'Historial clínico', Icon: Stethoscope, color: '#9FE870' },
  PESOS: { title: 'Historial de pesos', Icon: Scale, color: '#6EA8FF' },
  MOVIMIENTOS: { title: 'Movimientos', Icon: ArrowRightLeft, color: '#FFB84D' },
  VACUNAS: { title: 'Vacunas aplicadas', Icon: Syringe, color: '#39D0D8' },
  TRATAMIENTOS: { title: 'Tratamientos', Icon: Pill, color: '#9A7DFF' },
  DIAGNOSTICOS: { title: 'Diagnósticos', Icon: ClipboardList, color: '#FF8A4C' },
}

// Modelo comun de card de timeline: cada tipo de historial se mapea a esto.
type CardModel = {
  id: string
  fecha: string
  title: string
  badge?: { label: string; color: string }
  big?: string
  rows: Array<{ label: string; value: string }>
  observaciones?: string
}

// Las fechas del backend pueden venir como LocalDate o LocalDateTime: se
// recorta a los primeros 10 caracteres antes de formatear dd/mm/yyyy.
function formatFecha(value?: string): string {
  if (!value) return 'Sin fecha'
  return formatDateDisplay(value.slice(0, 10))
}

function severidadColor(value?: string): string {
  const normalized = value?.toUpperCase()
  if (normalized === 'CRITICA') return '#FF6B6B'
  if (normalized === 'ALTA') return '#FF8A4C'
  if (normalized === 'MEDIA') return '#FFB84D'
  return '#9FE870'
}

function row(label: string, value?: string | null): Array<{ label: string; value: string }> {
  return value ? [{ label, value }] : []
}

export default function AnimalHistorialScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ animalId?: string; caravana?: string; tipo?: string }>()

  const animalId = typeof params.animalId === 'string' ? params.animalId : undefined
  const caravana = typeof params.caravana === 'string' ? params.caravana : ''
  const tipo: HistorialTipo = TIPOS.includes(params.tipo as HistorialTipo) ? (params.tipo as HistorialTipo) : 'CLINICO'

  const config = tipoConfig[tipo]
  const HeaderIcon = config.Icon
  const { data, isLoading, isError } = useAnimalHistorial(tipo, animalId)
  const { data: potreros = [] } = usePotrerosList()

  // Los movimientos referencian potreros por id: se resuelven contra la lista
  // replicada offline para mostrar nombres legibles.
  const potreroNombre = useMemo(() => {
    const byId = new Map(potreros.map((potrero) => [potrero.id, potrero.nombre]))
    return (id?: string) => (id ? byId.get(id) ?? id : undefined)
  }, [potreros])

  const cards = useMemo<CardModel[]>(() => {
    if (!data) return []

    switch (tipo) {
      case 'CLINICO':
        return (data as HistorialMedicoAnimalResponse[]).map((item) => ({
          id: item.id,
          fecha: formatFecha(item.fecha),
          title: item.diagnostico || 'Consulta clínica',
          rows: [
            ...row('Tratamiento', item.tratamiento),
            ...row('Veterinario', item.veterinarioNombre ?? item.veterinario),
          ],
          observaciones: item.observaciones,
        }))
      case 'PESOS':
        return (data as PesajeResponse[]).map((item) => ({
          id: item.id,
          fecha: formatFecha(item.fecha),
          title: 'Pesaje',
          big: `${item.pesoKg} kg`,
          rows: [
            ...row('Condición corporal', item.condicionCorporal != null ? String(item.condicionCorporal) : undefined),
            ...row('Método', item.metodo),
            ...row('Responsable', item.responsableNombre ?? item.responsable),
          ],
          observaciones: item.observaciones,
        }))
      case 'MOVIMIENTOS':
        return (data as MovimientoAnimalResponse[]).map((item) => {
          // Se prefiere el nombre resuelto por el backend; la resolucion local
          // contra la replica de potreros queda como fallback offline.
          const origen = item.ubicacionOrigen || item.potreroOrigenNombre || potreroNombre(item.potreroOrigenId)
          const destino = item.ubicacionDestino || item.potreroDestinoNombre || potreroNombre(item.potreroDestinoId)
          return {
            id: item.id,
            fecha: formatFecha(item.fecha),
            title: origen || destino ? `${origen ?? 'Sin origen'} → ${destino ?? 'Sin destino'}` : 'Movimiento',
            badge: { label: item.tipoMovimiento, color: '#FFB84D' },
            rows: [
              ...row('Motivo', item.motivo),
              ...row('Responsable', item.responsableNombre ?? item.responsable),
            ],
            observaciones: item.observaciones,
          }
        })
      case 'VACUNAS':
        return (data as AplicacionVacunaResponse[]).map((item) => ({
          id: item.id,
          fecha: formatFecha(item.fechaAplicacion),
          title: item.vacunaNombre || 'Vacuna aplicada',
          rows: [
            ...row('Próxima dosis', item.proximaDosisFecha ? formatFecha(item.proximaDosisFecha) : undefined),
            ...row('Lote / marca', item.loteMarca),
            ...row('Operario', item.operarioNombre ?? item.operario),
          ],
          observaciones: item.observaciones,
        }))
      case 'TRATAMIENTOS':
        return (data as TratamientoMedicamentoResponse[]).map((item) => ({
          id: item.id,
          fecha: item.fechaFin
            ? `${formatFecha(item.fechaInicio)} - ${formatFecha(item.fechaFin)}`
            : formatFecha(item.fechaInicio),
          title: item.medicamento,
          rows: [
            ...row('Dosis', item.dosis),
            ...row('Vía de aplicación', item.viaAplicacion),
            ...row('Motivo', item.motivo),
            ...row('Responsable', item.responsableNombre ?? item.responsable),
          ],
          observaciones: item.observaciones,
        }))
      case 'DIAGNOSTICOS':
        return (data as DiagnosticoSanitarioResponse[]).map((item) => ({
          id: item.id,
          fecha: formatFecha(item.fechaDiagnostico),
          title: item.enfermedad,
          badge: item.severidad ? { label: item.severidad, color: severidadColor(item.severidad) } : undefined,
          rows: [
            ...row('Estado', item.estado),
            ...row('Veterinario', item.veterinarioNombre ?? item.veterinario),
            ...row('Tratamiento indicado', item.tratamientoIndicado),
          ],
          observaciones: item.observaciones,
        }))
      default:
        return []
    }
  }, [data, tipo, potreroNombre])

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#9FE870" strokeWidth={2.2} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{caravana ? `Caravana ${caravana}` : 'Animal sin caravana'}</Text>
        </View>
        <View style={[styles.headerIcon, { borderColor: `${config.color}40` }]}>
          <HeaderIcon size={19} color={config.color} strokeWidth={2} />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={config.color} />
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <HeaderIcon size={30} color="#A6B0CF" strokeWidth={1.6} />
              <Text style={styles.emptyText}>
                {isError ? 'No se pudieron cargar los registros. Revisá tu conexión.' : 'Sin registros'}
              </Text>
            </View>
          }
          renderItem={({ item }) => <TimelineCard card={item} accent={config.color} />}
        />
      )}
    </SafeAreaView>
  )
}

function TimelineCard({ card, accent }: { card: CardModel; accent: string }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, { backgroundColor: accent }]} />
        <View style={styles.timelineLine} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={styles.datePill}>
            <CalendarDays size={13} color="#A6B0CF" strokeWidth={2} />
            <Text style={styles.dateText}>{card.fecha}</Text>
          </View>
          {card.badge && (
            <View style={[styles.badge, { borderColor: `${card.badge.color}80`, backgroundColor: `${card.badge.color}18` }]}>
              <Text style={[styles.badgeText, { color: card.badge.color }]}>{card.badge.label}</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardTitle}>{card.title}</Text>
        {card.big && <Text style={[styles.bigValue, { color: accent }]}>{card.big}</Text>}

        {card.rows.map((item) => (
          <View key={item.label} style={styles.dataRow}>
            <ArrowRight size={12} color="#5C6A88" strokeWidth={2.2} />
            <Text style={styles.dataLabel}>{item.label}</Text>
            <Text style={styles.dataValue}>{item.value}</Text>
          </View>
        ))}

        {Boolean(card.observaciones) && (
          <View style={styles.observationBox}>
            <Text style={styles.dataLabel}>Observaciones</Text>
            <Text style={styles.observationText}>{card.observaciones}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#081225',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(11, 23, 48, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    color: '#A6B0CF',
    fontSize: 11,
    marginTop: 2,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 23, 48, 0.82)',
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 30,
  },
  emptyBox: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 70,
    paddingHorizontal: 30,
  },
  emptyText: {
    color: '#A6B0CF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineRail: {
    width: 12,
    alignItems: 'center',
  },
  timelineDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginTop: 20,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  card: {
    flex: 1,
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(11,23,48,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#9FE870',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  datePill: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dateText: {
    color: '#DCE8F8',
    fontSize: 11,
    fontWeight: '800',
  },
  badge: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '900',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 10,
  },
  bigValue: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    marginTop: 4,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 8,
  },
  dataLabel: {
    color: '#A6B0CF',
    fontSize: 11,
  },
  dataValue: {
    flex: 1,
    color: '#DCE8F8',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  observationBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 13,
    backgroundColor: 'rgba(8,18,37,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  observationText: {
    color: '#DCE8F8',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
})
