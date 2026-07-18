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
import { Colors } from '../../constants/colors'
import { login, register } from '../../shared/auth/api'
import { persistSession } from '../../shared/auth/session'
import { useSyncStatus } from '../../shared/sync/SyncProvider'

type Mode = 'login' | 'register'

type FormState = {
  email: string
  password: string
  name: string
  phone: string
}

const initialState: FormState = {
  email: '',
  password: '',
  name: '',
  phone: '',
}

function passwordMeetsPolicy(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)
}

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light'
  const c = Colors[scheme]
  const router = useRouter()
  const { syncNow } = useSyncStatus()
  const styles = createStyles(c)

  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setError(null)

    if (!form.email.trim() || !form.password.trim()) {
      setError('Email y contrasena son obligatorios.')
      return
    }

    if (mode === 'register') {
      if (!form.name.trim()) {
        setError('El nombre es obligatorio.')
        return
      }

      if (!passwordMeetsPolicy(form.password)) {
        setError('La contrasena no cumple la politica minima.')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const session = mode === 'login'
        ? await login({ email: form.email.trim(), password: form.password })
        : await register({
            email: form.email.trim(),
            password: form.password,
            name: form.name.trim(),
            phone: form.phone.trim() || undefined,
          })

      await persistSession(session)

      // Feature 39: si la cuenta todavia usa la contrasena inicial, forzar el
      // cambio antes de entrar a la app (el sync se dispara recien despues)
      if (session.user.mustChangePassword) {
        router.replace('/(auth)/cambiar-password' as never)
      } else {
        router.replace('/(tabs)')
        void syncNow()
      }
    } catch {
      setError('No fue posible autenticar la cuenta.')
    } finally {
      setIsSubmitting(false)
    }
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
              <Text style={styles.logoText}>CA</Text>
            </View>
            <Text style={styles.eyebrow}>Feature 26</Text>
            <Text style={styles.title}>Acceso seguro al campo operativo</Text>
            <Text style={styles.subtitle}>
              Login y registro base para mobile, con persistencia segura de tokens.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.modeSwitch}>
              <Pressable style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]} onPress={() => setMode('login')}>
                <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>Login</Text>
              </Pressable>
              <Pressable style={[styles.modeButton, mode === 'register' && styles.modeButtonActive]} onPress={() => setMode('register')}>
                <Text style={[styles.modeText, mode === 'register' && styles.modeTextActive]}>Registro</Text>
              </Pressable>
            </View>

            {mode === 'register' && (
              <>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Maria Gomez"
                  placeholderTextColor={c.mutedForeground}
                  value={form.name}
                  onChangeText={(name) => setForm((current) => ({ ...current, name }))}
                />

                <Text style={styles.label}>Telefono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+54 9 11 5555 5555"
                  placeholderTextColor={c.mutedForeground}
                  value={form.phone}
                  onChangeText={(phone) => setForm((current) => ({ ...current, phone }))}
                />
              </>
            )}

            <Text style={styles.label}>Email o usuario</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="admin@campoapp.com"
              placeholderTextColor={c.mutedForeground}
              value={form.email}
              onChangeText={(email) => setForm((current) => ({ ...current, email }))}
            />

            <Text style={styles.label}>Contrasena</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Admin@Campo2024!"
              placeholderTextColor={c.mutedForeground}
              value={form.password}
              onChangeText={(password) => setForm((current) => ({ ...current, password }))}
            />

            {mode === 'register' && (
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  Politica minima: 8 caracteres, mayusculas, minusculas, numeros y simbolos.
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={styles.submitButtonText}>
                {isSubmitting
                  ? 'Procesando...'
                  : mode === 'login'
                    ? 'Ingresar'
                    : 'Crear cuenta'}
              </Text>
            </Pressable>

            <View style={styles.metaGrid}>
              <View style={styles.metaCard}>
                <Text style={styles.metaTitle}>Ya cubierto</Text>
                <Text style={styles.metaBody}>Login, registro y guardado seguro de tokens.</Text>
              </View>
              <View style={styles.metaCard}>
                <Text style={styles.metaTitle}>Pendiente</Text>
                <Text style={styles.metaBody}>OAuth y reset de contrasena todavia sin UI mobile.</Text>
              </View>
            </View>
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
    logoText: {
      color: c.primaryForeground,
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: 2,
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
    modeSwitch: {
      flexDirection: 'row',
      backgroundColor: c.background,
      borderRadius: 16,
      padding: 4,
      marginBottom: 6,
    },
    modeButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modeButtonActive: {
      backgroundColor: c.primary,
    },
    modeText: {
      color: c.mutedForeground,
      fontSize: 14,
      fontWeight: '700',
    },
    modeTextActive: {
      color: c.primaryForeground,
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
    metaGrid: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    metaCard: {
      flex: 1,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background,
      padding: 14,
      gap: 8,
    },
    metaTitle: {
      color: c.foreground,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    metaBody: {
      color: c.mutedForeground,
      fontSize: 12,
      lineHeight: 18,
    },
  })
}
