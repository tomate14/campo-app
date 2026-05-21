import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, useColorScheme,
  RefreshControl, Image,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../constants/colors'
import {
  useClimaActual, usePronostico, useAlertasClima,
  useRecomendaciones, useMarcarAlertaLeida, useSincronizarClima,
} from '../../shared/hooks/useClima'
import type { SeveridadAlerta, TipoAlerta } from '../../../frontend/src/lib/types/clima'

const OWM_ICON = (code: string) => `https://openweathermap.org/img/wn/${code}@2x.png`

const SEVERIDAD_BG: Record<SeveridadAlerta, string> = {
  BAJA:    '#EFF6FF',
  MEDIA:   '#FEFCE8',
  ALTA:    '#FFF7ED',
  CRITICA: '#FEF2F2',
}
const SEVERIDAD_BORDER: Record<SeveridadAlerta, string> = {
  BAJA:    '#BFDBFE',
  MEDIA:   '#FDE68A',
  ALTA:    '#FED7AA',
  CRITICA: '#FECACA',
}

const TIPO_LABEL: Record<TipoAlerta, string> = {
  HELADA:          '🧊 Helada',
  LLUVIA_EXCESIVA: '🌧 Lluvia excesiva',
  SEQUIA:          '☀️ Sequía',
  VIENTO_FUERTE:   '💨 Viento fuerte',
  GRANIZO:         '⛈ Granizo',
  TORMENTA:        '⚡ Tormenta',
}

const PRIORIDAD_COLOR: Record<string, string> = {
  BAJA: '#4ADE80',
  MEDIA: '#FACC15',
  ALTA: '#F87171',
}

export default function ClimaLoteScreen() {
  const { loteId, loteNombre } = useLocalSearchParams<{ loteId: string; loteNombre?: string }>()
  const router = useRouter()
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]

  const { data: actual, isLoading, refetch } = useClimaActual(loteId)
  const { data: pronostico = [] } = usePronostico(loteId)
  const { data: alertas = [] } = useAlertasClima(loteId)
  const { data: recomendaciones } = useRecomendaciones(loteId)
  const marcarLeida = useMarcarAlertaLeida(loteId)
  const sincronizar = useSincronizarClima(loteId)

  const vientoDir = (deg?: number) => {
    if (deg == null) return ''
    const dirs = ['N','NE','E','SE','S','SO','O','NO']
    return dirs[Math.round(deg / 45) % 8]
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
      backgroundColor: c.card, borderBottomWidth: 1, borderBottomColor: c.border,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: c.background, alignItems: 'center', justifyContent: 'center',
    },
    backText: { fontSize: 18, color: c.foreground },
    headerText: { flex: 1 },
    title: { fontSize: 18, fontWeight: '700', color: c.foreground },
    subtitle: { fontSize: 13, color: c.muted },
    syncBtn: {
      backgroundColor: c.primary, borderRadius: 10,
      paddingHorizontal: 12, paddingVertical: 8,
    },
    syncText: { color: c.primaryForeground, fontSize: 13, fontWeight: '600' },
    content: { padding: 16, gap: 16 },
    section: { gap: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: c.foreground },
    currentCard: {
      backgroundColor: c.card, borderRadius: 16,
      borderWidth: 1, borderColor: c.cardBorder, padding: 16,
    },
    tempRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    tempText: { fontSize: 52, fontWeight: '800', color: c.foreground },
    descText: { fontSize: 15, color: c.mutedForeground, textTransform: 'capitalize', marginTop: 2 },
    localText: { fontSize: 12, color: c.muted, marginTop: 2 },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    metric: { flex: 1, minWidth: '30%', backgroundColor: c.background, borderRadius: 10, padding: 8 },
    metricLabel: { fontSize: 11, color: c.muted },
    metricValue: { fontSize: 13, fontWeight: '700', color: c.foreground, marginTop: 2 },
    tsText: { fontSize: 11, color: c.muted, marginTop: 8 },
    forecastScroll: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
    forecastCard: {
      width: 90, backgroundColor: c.card, borderRadius: 12,
      borderWidth: 1, borderColor: c.cardBorder,
      padding: 10, alignItems: 'center',
    },
    forecastDate: { fontSize: 11, color: c.muted, textAlign: 'center' },
    forecastTempMax: { fontSize: 15, fontWeight: '700', color: c.foreground },
    forecastTempMin: { fontSize: 13, color: c.muted },
    forecastPop: { fontSize: 11, color: c.primary, marginTop: 2 },
    alertCard: {
      borderRadius: 12, borderWidth: 1, padding: 12,
    },
    alertTipo: { fontSize: 12, fontWeight: '700' },
    alertMsg: { fontSize: 12, marginTop: 4, color: c.foreground },
    alertLeerBtn: { alignSelf: 'flex-end', marginTop: 6 },
    alertLeerText: { fontSize: 12, color: c.primary, textDecorationLine: 'underline' },
    recCard: {
      backgroundColor: c.card, borderRadius: 12,
      borderWidth: 1, borderColor: c.cardBorder, padding: 12,
    },
    recHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    recDot: { width: 8, height: 8, borderRadius: 4 },
    recCat: { fontSize: 11, fontWeight: '700', color: c.muted, textTransform: 'uppercase' },
    recMsg: { fontSize: 13, color: c.foreground, marginTop: 4 },
    emptyBox: {
      borderRadius: 12, borderWidth: 1, borderColor: c.border,
      borderStyle: 'dashed', padding: 20, alignItems: 'center',
    },
    emptyText: { fontSize: 14, color: c.muted },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  })

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.title}>Clima</Text>
          {loteNombre && <Text style={s.subtitle}>{loteNombre}</Text>}
        </View>
        <TouchableOpacity
          style={s.syncBtn}
          onPress={() => sincronizar.mutate()}
          disabled={sincronizar.isPending}
          activeOpacity={0.85}
        >
          <Text style={s.syncText}>{sincronizar.isPending ? '...' : '↻ Sync'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={c.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={c.primary} />}
        >
          {/* Condición actual */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Condición actual</Text>
            {!actual ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>Sin datos — sincronizá primero</Text>
              </View>
            ) : (
              <View style={s.currentCard}>
                <View style={s.tempRow}>
                  {actual.iconoCodigo && (
                    <Image source={{ uri: OWM_ICON(actual.iconoCodigo) }} style={{ width: 64, height: 64 }} />
                  )}
                  <View>
                    <Text style={s.tempText}>
                      {actual.temperatura != null ? `${actual.temperatura}°` : '—'}
                    </Text>
                    <Text style={s.descText}>{actual.descripcion ?? '—'}</Text>
                    {actual.nombreLocalidad && <Text style={s.localText}>{actual.nombreLocalidad}</Text>}
                  </View>
                </View>
                <View style={s.metricsGrid}>
                  {actual.sensacionTermica != null && (
                    <View style={s.metric}>
                      <Text style={s.metricLabel}>Sensación</Text>
                      <Text style={s.metricValue}>{actual.sensacionTermica}°C</Text>
                    </View>
                  )}
                  {actual.humedadPct != null && (
                    <View style={s.metric}>
                      <Text style={s.metricLabel}>Humedad</Text>
                      <Text style={s.metricValue}>{actual.humedadPct}%</Text>
                    </View>
                  )}
                  {actual.velocidadViento != null && (
                    <View style={s.metric}>
                      <Text style={s.metricLabel}>Viento</Text>
                      <Text style={s.metricValue}>{actual.velocidadViento} m/s {vientoDir(actual.direccionViento)}</Text>
                    </View>
                  )}
                  {actual.presionHpa != null && (
                    <View style={s.metric}>
                      <Text style={s.metricLabel}>Presión</Text>
                      <Text style={s.metricValue}>{actual.presionHpa} hPa</Text>
                    </View>
                  )}
                  {actual.tempMin != null && (
                    <View style={s.metric}>
                      <Text style={s.metricLabel}>Mín / Máx</Text>
                      <Text style={s.metricValue}>{actual.tempMin}° / {actual.tempMax}°</Text>
                    </View>
                  )}
                </View>
                <Text style={s.tsText}>
                  Actualizado: {new Date(actual.timestampUtc + 'Z').toLocaleString('es-AR')}
                </Text>
              </View>
            )}
          </View>

          {/* Pronóstico */}
          {pronostico.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Pronóstico</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.forecastScroll}>
                {pronostico.map(p => (
                  <View key={p.id} style={s.forecastCard}>
                    <Text style={s.forecastDate}>
                      {new Date(p.fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })}
                    </Text>
                    {p.iconoCodigo && (
                      <Image source={{ uri: OWM_ICON(p.iconoCodigo) }} style={{ width: 40, height: 40 }} />
                    )}
                    <Text style={s.forecastTempMax}>{p.tempMax != null ? `${p.tempMax}°` : '—'}</Text>
                    <Text style={s.forecastTempMin}>{p.tempMin != null ? `${p.tempMin}°` : '—'}</Text>
                    {p.probabilidadLluvia != null && p.probabilidadLluvia > 0 && (
                      <Text style={s.forecastPop}>{Math.round(p.probabilidadLluvia)}%</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Alertas */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              Alertas {alertas.length > 0 ? `(${alertas.length})` : ''}
            </Text>
            {alertas.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>Sin alertas activas</Text>
              </View>
            ) : (
              alertas.map(a => (
                <View
                  key={a.id}
                  style={[s.alertCard, {
                    backgroundColor: SEVERIDAD_BG[a.severidad],
                    borderColor: SEVERIDAD_BORDER[a.severidad],
                  }]}
                >
                  <Text style={s.alertTipo}>{TIPO_LABEL[a.tipoAlerta]}</Text>
                  <Text style={s.alertMsg}>{a.mensaje}</Text>
                  <TouchableOpacity
                    style={s.alertLeerBtn}
                    onPress={() => marcarLeida.mutate(a.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.alertLeerText}>Marcar como leída</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Recomendaciones */}
          {recomendaciones && recomendaciones.recomendaciones.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Recomendaciones</Text>
              {recomendaciones.recomendaciones.map((r, i) => (
                <View key={i} style={s.recCard}>
                  <View style={s.recHeader}>
                    <View style={[s.recDot, { backgroundColor: PRIORIDAD_COLOR[r.prioridad] ?? c.muted }]} />
                    <Text style={s.recCat}>{r.categoria}</Text>
                  </View>
                  <Text style={s.recMsg}>{r.mensaje}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}
