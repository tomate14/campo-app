import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, useColorScheme,
  RefreshControl,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../../constants/colors'
import { useHistorialByLote, useRotacion, useCreateHistorico, useDeleteHistorico } from '../../../shared/hooks/useHistorial'
import { HistorialFormModal } from '../../../components/agricola/HistorialFormModal'
import type { HistoricoCultivoRequest } from '../../../../frontend/src/lib/types/agricola'

export default function HistorialScreen() {
  const { loteId, loteNombre } = useLocalSearchParams<{ loteId: string; loteNombre?: string }>()
  const router = useRouter()
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]

  const [showForm, setShowForm] = useState(false)
  const { data: historial = [], isLoading, refetch } = useHistorialByLote(loteId)
  const { data: rotacion } = useRotacion(loteId)
  const createHistorico = useCreateHistorico(loteId)
  const deleteHistorico = useDeleteHistorico(loteId)

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar registro',
      '¿Confirmás que querés eliminar este registro de cultivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteHistorico.mutate(id) },
      ]
    )
  }

  const handleCreate = async (data: HistoricoCultivoRequest) => {
    await createHistorico.mutateAsync(data)
    setShowForm(false)
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
    title: { fontSize: 18, fontWeight: '700', color: c.foreground, flex: 1 },
    subtitle: { fontSize: 13, color: c.muted },
    addBtn: { backgroundColor: c.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    addBtnText: { color: c.primaryForeground, fontSize: 13, fontWeight: '600' },
    content: { padding: 16, gap: 12 },
    rotacionCard: {
      backgroundColor: '#FFF7ED', borderRadius: 12,
      borderWidth: 1, borderColor: '#FDBA74',
      padding: 14,
    },
    rotacionTitle: { fontSize: 13, fontWeight: '700', color: c.accent },
    rotacionRazon: { fontSize: 13, color: '#92400E', marginTop: 4 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    chip: {
      backgroundColor: '#DBEAFE', borderRadius: 20,
      paddingHorizontal: 10, paddingVertical: 4,
    },
    chipText: { fontSize: 12, fontWeight: '600', color: c.primary },
    card: {
      backgroundColor: c.card, borderRadius: 12,
      borderWidth: 1, borderColor: c.cardBorder, padding: 14,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cultivo: { fontSize: 16, fontWeight: '700', color: c.foreground },
    temporada: { fontSize: 13, color: c.muted, marginTop: 2 },
    deleteBtn: { paddingHorizontal: 8, paddingVertical: 4 },
    deleteText: { fontSize: 13, color: c.destructive },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    metric: { flex: 1, minWidth: '28%', backgroundColor: c.background, borderRadius: 8, padding: 8 },
    metricLabel: { fontSize: 11, color: c.muted, marginBottom: 2 },
    metricValue: { fontSize: 14, fontWeight: '700', color: c.foreground },
    obs: { fontSize: 13, color: c.mutedForeground, marginTop: 8 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
    emptyText: { fontSize: 15, color: c.muted, textAlign: 'center' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  })

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Historial de Cultivos</Text>
          {loteNombre && <Text style={s.subtitle}>{loteNombre}</Text>}
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)} activeOpacity={0.85}>
          <Text style={s.addBtnText}>+ Nuevo</Text>
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
          {/* Rotación recomendada */}
          {rotacion && (
            <View style={s.rotacionCard}>
              <Text style={s.rotacionTitle}>Recomendación de rotación</Text>
              {rotacion.ultimoCultivo && (
                <Text style={[s.rotacionRazon, { fontWeight: '600' }]}>
                  Último: {rotacion.ultimoCultivo} ({rotacion.ultimaTemporada})
                </Text>
              )}
              <Text style={s.rotacionRazon}>{rotacion.razon}</Text>
              <View style={s.chips}>
                {rotacion.cultivosRecomendados.map((cult) => (
                  <View key={cult} style={s.chip}>
                    <Text style={s.chipText}>{cult}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {historial.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={s.emptyText}>No hay historial de cultivos{'\n'}registrado para este lote.</Text>
            </View>
          ) : (
            historial.map((item) => (
              <View key={item.id} style={s.card}>
                <View style={s.cardHeader}>
                  <View>
                    <Text style={s.cultivo}>{item.cultivo}</Text>
                    <Text style={s.temporada}>{item.temporada}</Text>
                  </View>
                  <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item.id)} activeOpacity={0.7}>
                    <Text style={s.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.metricsGrid}>
                  {item.fechaSiembra && (
                    <View style={s.metric}>
                      <Text style={s.metricLabel}>Siembra</Text>
                      <Text style={s.metricValue}>
                        {new Date(item.fechaSiembra).toLocaleDateString('es-AR')}
                      </Text>
                    </View>
                  )}
                  {item.fechaCosecha && (
                    <View style={s.metric}>
                      <Text style={s.metricLabel}>Cosecha</Text>
                      <Text style={s.metricValue}>
                        {new Date(item.fechaCosecha).toLocaleDateString('es-AR')}
                      </Text>
                    </View>
                  )}
                  {item.rendimientoKgHa !== undefined && (
                    <View style={s.metric}>
                      <Text style={s.metricLabel}>Rend. kg/ha</Text>
                      <Text style={s.metricValue}>{item.rendimientoKgHa}</Text>
                    </View>
                  )}
                </View>
                {item.observaciones && <Text style={s.obs}>{item.observaciones}</Text>}
              </View>
            ))
          )}
        </ScrollView>
      )}

      <HistorialFormModal
        visible={showForm}
        loteId={loteId}
        onSubmit={handleCreate}
        onCancel={() => setShowForm(false)}
        isLoading={createHistorico.isPending}
        colors={c}
      />
    </View>
  )
}
