import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { isAxiosError } from 'axios'
import { KeyRound } from 'lucide-react-native'
import { Colors } from '../../constants/colors'
import { changeInitialPassword } from '../../shared/auth/api'
import { clearSession, persistSession } from '../../shared/auth/session'
import { useSyncStatus } from '../../shared/sync/SyncProvider'

type FormState = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const initialState: FormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

// Politica del backend: minimo 8 caracteres, minuscula, mayuscula, numero y simbolo de @$!%*?&
const POLICY_MESSAGE =
  'La nueva contrasena debe tener al menos 8 caracteres e incluir una minuscula, una mayuscula, un numero y un simbolo (@$!%*?&).'

function passwordMeetsPolicy(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)
}

export default function CambiarPasswordScreen() {
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]
  const router = useRouter()
  const { syncNow } = useSyncStatus()
  const styles = createStyles(c)

  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setError(null)

    if (!form.currentPassword.trim() || !form.newPassword.trim() || !form.confirmPassword.trim()) {
      setError('Completa los tres campos para continuar.')
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('La nueva contrasena y su confirmacion no coinciden.')
      return
    }

    if (!passwordMeetsPolicy(form.newPassword)) {
      setError(POLICY_MESSAGE)
      return
    }

    if (form.newPassword === form.currentPassword) {
      setError('La nueva contrasena debe ser distinta de la actual.')
      return
    }

    setIsSubmitting(true)

    try {
      const session = await changeInitialPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })

      // El backend devuelve tokens nuevos y revoca los anteriores
      await persistSession(session)
      router.replace('/(tabs)')
      void syncNow()
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('La contrasena actual es incorrecta.')
      } else {
        setError('No fue posible actualizar la contrasena. Intenta nuevamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleBackToLogin() {
    // Unica salida permitida: cerrar la sesion y volver al login
    await clearSession()
    router.replace('/(auth)/login')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.logo}>
              <KeyRound size={26} color={c.primaryForeground} />
            </View>
            <Text style={styles.eyebrow}>Primer ingreso</Text>
            <Text style={styles.title}>Cambia tu contrasena</Text>
            <Text style={styles.subtitle}>
              Tu cuenta todavia usa la contrasena inicial asignada. Por seguridad tenes que
              reemplazarla antes de continuar usando la aplicacion.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Contrasena actual</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Contrasena inicial"
              placeholderTextColor={c.mutedForeground}
              value={form.currentPassword}
              onChangeText={(currentPassword) => setForm((current) => ({ ...current, currentPassword }))}
            />

            <Text style={styles.label}>Nueva contrasena</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Nueva contrasena"
              placeholderTextColor={c.mutedForeground}
              value={form.newPassword}
              onChangeText={(newPassword) => setForm((current) => ({ ...current, newPassword }))}
            />

            <Text style={styles.label}>Confirmar nueva contrasena</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Repetir nueva contrasena"
              placeholderTextColor={c.mutedForeground}
              value={form.confirmPassword}
              onChangeText={(confirmPassword) => setForm((current) => ({ ...current, confirmPassword }))}
            />

            <View style={styles.tipBox}>
              <Text style={styles.tipText}>{POLICY_MESSAGE}</Text>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Actualizando...' : 'Actualizar contrasena'}
              </Text>
            </Pressable>

            <Pressable style={styles.backLink} onPress={handleBackToLogin} disabled={isSubmitting}>
              <Text style={styles.backLinkText}>Volver al login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function createStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    keyboard: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      padding: 20,
      justifyContent: 'center',
      gap: 24,
    },
    hero: {
      gap: 10,
    },
    logo: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eyebrow: {
      color: c.mutedForeground,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    title: {
      color: c.foreground,
      fontSize: 28,
      fontWeight: '800',
    },
    subtitle: {
      color: c.mutedForeground,
      fontSize: 15,
      lineHeight: 22,
    },
    card: {
      backgroundColor: c.card,
      borderColor: c.cardBorder,
      borderWidth: 1,
      borderRadius: 24,
      padding: 20,
      gap: 12,
    },
    label: {
      color: c.mutedForeground,
      fontSize: 13,
      fontWeight: '700',
      marginTop: 2,
    },
    input: {
      minHeight: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background,
      color: c.foreground,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },
    tipBox: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background,
      padding: 12,
    },
    tipText: {
      color: c.mutedForeground,
      fontSize: 12,
      lineHeight: 18,
    },
    errorBox: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.destructive,
      backgroundColor: 'rgba(220, 38, 38, 0.12)',
      padding: 12,
    },
    errorText: {
      color: '#FCA5A5',
      fontSize: 13,
      fontWeight: '600',
    },
    submitButton: {
      minHeight: 50,
      borderRadius: 16,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: c.primaryForeground,
      fontSize: 15,
      fontWeight: '800',
    },
    backLink: {
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backLinkText: {
      color: c.mutedForeground,
      fontSize: 13,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
  })
}
