import React, { useState } from 'react'
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import type { ColorScheme } from '../../constants/colors'
import type { HistoricoCultivoRequest } from '../../../frontend/src/lib/types/agricola'

interface Props {
  visible: boolean
  loteId: string
  onSubmit: (data: HistoricoCultivoRequest) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  colors: ColorScheme
}

const CULTIVOS = ['SOJA', 'MAIZ', 'TRIGO', 'GIRASOL', 'SORGO', 'OTRO']

export function HistorialFormModal({ visible, loteId, onSubmit, onCancel, isLoading, colors: c }: Props) {
  const [cultivo, setCultivo] = useState('')
  const [temporada, setTemporada] = useState('')
  const [fechaSiembra, setFechaSiembra] = useState('')
  const [fechaCosecha, setFechaCosecha] = useState('')
  const [rendimiento, setRendimiento] = useState('')
  const [obs, setObs] = useState('')

  const handleSubmit = async () => {
    if (!cultivo || !temporada) return
    await onSubmit({
      loteId, cultivo, temporada,
      fechaSiembra: fechaSiembra || undefined,
      fechaCosecha: fechaCosecha || undefined,
      rendimientoKgHa: rendimiento ? parseFloat(rendimiento) : undefined,
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
    label: { fontSize: 12, fontWeight: '600', color: c.mutedForeground, marginBottom: 6 },
    input: {
      borderWidth: 1, borderColor: c.border, borderRadius: 10,
      padding: 10, fontSize: 15, color: c.foreground,
      backgroundColor: c.background,
    },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
      borderWidth: 1, borderColor: c.border, backgroundColor: c.background,
    },
    chipSelected: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: c.foreground },
    chipTextSelected: { color: c.primaryForeground },
    row: { flexDirection: 'row', gap: 12 },
    fieldHalf: { flex: 1 },
    submitBtn: {
      backgroundColor: c.primary, borderRadius: 12,
      padding: 14, alignItems: 'center', margin: 16,
    },
    submitBtnDisabled: { backgroundColor: c.muted },
    submitText: { color: c.primaryForeground, fontSize: 15, fontWeight: '700' },
  })

  const canSubmit = cultivo && temporada && !isLoading

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.headerTitle}>Registrar cultivo histórico</Text>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
            <View>
              <Text style={s.label}>CULTIVO *</Text>
              <View style={s.chipsRow}>
                {CULTIVOS.map((c_) => (
                  <TouchableOpacity
                    key={c_}
                    style={[s.chip, cultivo === c_ && s.chipSelected]}
                    onPress={() => setCultivo(c_)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.chipText, cultivo === c_ && s.chipTextSelected]}>{c_}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text style={s.label}>TEMPORADA *</Text>
              <TextInput
                style={s.input} value={temporada} onChangeText={setTemporada}
                placeholder="Ej: 2023/24" placeholderTextColor={c.muted}
              />
            </View>
            <View style={s.row}>
              <View style={s.fieldHalf}>
                <Text style={s.label}>FECHA SIEMBRA</Text>
                <TextInput
                  style={s.input} value={fechaSiembra} onChangeText={setFechaSiembra}
                  placeholder="YYYY-MM-DD" placeholderTextColor={c.muted}
                />
              </View>
              <View style={s.fieldHalf}>
                <Text style={s.label}>FECHA COSECHA</Text>
                <TextInput
                  style={s.input} value={fechaCosecha} onChangeText={setFechaCosecha}
                  placeholder="YYYY-MM-DD" placeholderTextColor={c.muted}
                />
              </View>
            </View>
            <View>
              <Text style={s.label}>RENDIMIENTO (kg/ha)</Text>
              <TextInput
                style={s.input} value={rendimiento} onChangeText={setRendimiento}
                keyboardType="decimal-pad" placeholderTextColor={c.muted}
              />
            </View>
            <View>
              <Text style={s.label}>OBSERVACIONES</Text>
              <TextInput
                style={[s.input, { minHeight: 60 }]} value={obs} onChangeText={setObs}
                multiline placeholder="Notas opcionales..." placeholderTextColor={c.muted}
              />
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            <Text style={s.submitText}>{isLoading ? 'Guardando...' : 'Registrar cultivo'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
