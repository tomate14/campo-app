import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, useColorScheme,
  RefreshControl,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../../constants/colors'
import { useSueloByLote, useCreateSuelo, useDeleteSuelo } from '../../../shared/hooks/useSuelo'
import { SueloFormModal } from '../../../components/agricola/SueloFormModal'
import type { PropiedadSueloRequest } from '../../../shared/types/agricola'

export default function SueloScreen() {
  const { loteId, loteNombre } = useLocalSearchParams<{ loteId: string; loteNombre?: string }>()
  const router = useRouter()
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]

  const [showForm, setShowForm] = useState(false)
  const { data: suelo = [], isLoading, refetch } = useSueloByLote(loteId)
  const createSuelo = useCreateSuelo(loteId)
  const deleteSuelo = useDeleteSuelo(loteId)

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar análisis',
      '¿Confirmás que querés eliminar este análisis de suelo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteSuelo.mutate(id),
        },
      ]
    )
  }

  const handleCreate = async (data: PropiedadSueloRequest) => {
    await createSuelo.mutateAsync(data)
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
    addBtn: {
      backgroundColor: c.primary, borderRadius: 10,
      paddingHorizontal: 14, paddingVertical: 8,
    },
    addBtnText: { color: c.primaryForeground, fontSize: 13, fontWeight: '600' },
    content: { padding: 16, gap: 12 },
    card: {
      backgroundColor: c.card, borderRadius: 12,
      borderWidth: 1, borderColor: c.cardBorder,
      padding: 14,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    dateText: { fontSize: 15, fontWeight: '600', color: c.foreground },
    deleteBtn: { paddingHorizontal: 8, paddingVertical: 4 },
    deleteText: { fontSize: 13, color: c.destructive },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    metric: {
      flex: 1, minWidth: '28%', backgroundColor: c.background,
      borderRadius: 8, padding: 8,
    },
    metricLabel: { fontSize: 11, color: c.muted, marginBottom: 2 },
    metricValue: { fontSize: 14, fontWeight: '700', color: c.foreground },
    obs: { fontSize: 13, color: c.mutedForeground, marginTop: 8 },
    empty: {
      flex: 1, alignItems: 'center', justifyContent: 'center',
      paddingTop: 80, gap: 8,
    },
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
          <Text style={s.title}>Análisis de Suelo</Text>
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
      ) : suelo.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>No hay análisis de suelo{'\n'}registrados para este lote.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={c.primary} />}
        >
          {suelo.map((item) => (
            <View key={item.id} style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.dateText}>
                  {new Date(item.fecha).toLocaleDateString('es-AR', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </Text>
                <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(item.id)} activeOpacity={0.7}>
                  <Text style={s.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>

              <View style={s.metricsGrid}>
                {item.ph !== undefined && (
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>pH</Text>
                    <Text style={s.metricValue}>{item.ph}</Text>
                  </View>
                )}
                {item.nitrogenoKgHa !== undefined && (
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>N (kg/ha)</Text>
                    <Text style={s.metricValue}>{item.nitrogenoKgHa}</Text>
                  </View>
                )}
                {item.fosforoKgHa !== undefined && (
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>P (kg/ha)</Text>
                    <Text style={s.metricValue}>{item.fosforoKgHa}</Text>
                  </View>
                )}
                {item.potasioKgHa !== undefined && (
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>K (kg/ha)</Text>
                    <Text style={s.metricValue}>{item.potasioKgHa}</Text>
                  </View>
                )}
                {item.materiaOrganicaPct !== undefined && (
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>M.O. (%)</Text>
                    <Text style={s.metricValue}>{item.materiaOrganicaPct}</Text>
                  </View>
                )}
                {item.conductividadElectrica !== undefined && (
                  <View style={s.metric}>
                    <Text style={s.metricLabel}>CE (dS/m)</Text>
                    <Text style={s.metricValue}>{item.conductividadElectrica}</Text>
                  </View>
                )}
              </View>
              {item.observaciones && <Text style={s.obs}>{item.observaciones}</Text>}
            </View>
          ))}
        </ScrollView>
      )}

      <SueloFormModal
        visible={showForm}
        loteId={loteId}
        onSubmit={handleCreate}
        onCancel={() => setShowForm(false)}
        isLoading={createSuelo.isPending}
        colors={c}
      />
    </View>
  )
}
