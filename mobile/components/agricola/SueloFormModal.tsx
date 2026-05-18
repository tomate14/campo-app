import React, { useState } from 'react'
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import type { ColorScheme } from '../../constants/colors'
import type { PropiedadSueloRequest } from '../../../frontend/src/lib/types/agricola'

interface Props {
  visible: boolean
  loteId: string
  onSubmit: (data: PropiedadSueloRequest) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  colors: ColorScheme
}

const today = () => new Date().toISOString().split('T')[0]

export function SueloFormModal({ visible, loteId, onSubmit, onCancel, isLoading, colors: c }: Props) {
  const [fecha, setFecha] = useState(today())
  const [ph, setPh] = useState('')
  const [nitrogeno, setNitrogeno] = useState('')
  const [fosforo, setFosforo] = useState('')
  const [potasio, setPotasio] = useState('')
  const [matOrgPct, setMatOrgPct] = useState('')
  const [ce, setCe] = useState('')
  const [obs, setObs] = useState('')

  const num = (v: string) => (v === '' ? undefined : parseFloat(v))

  const handleSubmit = async () => {
    if (!fecha) return
    await onSubmit({
      loteId, fecha,
      ph: num(ph), nitrogenoKgHa: num(nitrogeno),
      fosforoKgHa: num(fosforo), potasioKgHa: num(potasio),
      materiaOrganicaPct: num(matOrgPct), conductividadElectrica: num(ce),
      observaciones: obs || undefined,
    })
  }

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
      maxHeight: '90%',
    },
    handle: {
      width: 40, height: 4, borderRadius: 2, backgroundColor: c.border,
      alignSelf: 'center', marginTop: 12, marginBottom: 4,
    },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: c.border,
    },
    headerTitle: { fontSize: 16, fontWeight: '700', color: c.foreground },
    cancelText: { fontSize: 14, color: c.muted },
    content: { padding: 16, gap: 14 },
    row: { flexDirection: 'row', gap: 12 },
    fieldHalf: { flex: 1 },
    label: { fontSize: 12, fontWeight: '600', color: c.mutedForeground, marginBottom: 6 },
    input: {
      borderWidth: 1, borderColor: c.border, borderRadius: 10,
      padding: 10, fontSize: 15, color: c.foreground,
      backgroundColor: c.background,
    },
    submitBtn: {
      backgroundColor: c.primary, borderRadius: 12,
      padding: 14, alignItems: 'center', margin: 16,
    },
    submitText: { color: c.primaryForeground, fontSize: 15, fontWeight: '700' },
  })

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.headerTitle}>Nuevo análisis de suelo</Text>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
            <View>
              <Text style={s.label}>FECHA *</Text>
              <TextInput
                style={s.input} value={fecha} onChangeText={setFecha}
                placeholder="YYYY-MM-DD" placeholderTextColor={c.muted}
              />
            </View>
            <View style={s.row}>
              <View style={s.fieldHalf}>
                <Text style={s.label}>pH (0–14)</Text>
                <TextInput style={s.input} value={ph} onChangeText={setPh}
                  keyboardType="decimal-pad" placeholder="Ej: 6.5" placeholderTextColor={c.muted} />
              </View>
              <View style={s.fieldHalf}>
                <Text style={s.label}>N (kg/ha)</Text>
                <TextInput style={s.input} value={nitrogeno} onChangeText={setNitrogeno}
                  keyboardType="decimal-pad" placeholderTextColor={c.muted} />
              </View>
            </View>
            <View style={s.row}>
              <View style={s.fieldHalf}>
                <Text style={s.label}>P (kg/ha)</Text>
                <TextInput style={s.input} value={fosforo} onChangeText={setFosforo}
                  keyboardType="decimal-pad" placeholderTextColor={c.muted} />
              </View>
              <View style={s.fieldHalf}>
                <Text style={s.label}>K (kg/ha)</Text>
                <TextInput style={s.input} value={potasio} onChangeText={setPotasio}
                  keyboardType="decimal-pad" placeholderTextColor={c.muted} />
              </View>
            </View>
            <View style={s.row}>
              <View style={s.fieldHalf}>
                <Text style={s.label}>M.O. (%)</Text>
                <TextInput style={s.input} value={matOrgPct} onChangeText={setMatOrgPct}
                  keyboardType="decimal-pad" placeholderTextColor={c.muted} />
              </View>
              <View style={s.fieldHalf}>
                <Text style={s.label}>CE (dS/m)</Text>
                <TextInput style={s.input} value={ce} onChangeText={setCe}
                  keyboardType="decimal-pad" placeholderTextColor={c.muted} />
              </View>
            </View>
            <View>
              <Text style={s.label}>OBSERVACIONES</Text>
              <TextInput
                style={[s.input, { minHeight: 60 }]} value={obs} onChangeText={setObs}
                multiline placeholder="Notas opcionales..." placeholderTextColor={c.muted}
              />
            </View>
          </ScrollView>
          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.85}>
            <Text style={s.submitText}>{isLoading ? 'Guardando...' : 'Guardar análisis'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
