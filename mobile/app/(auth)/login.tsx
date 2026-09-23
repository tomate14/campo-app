import { useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Eye, EyeOff, HelpCircle, Lock, Mail } from 'lucide-react-native'
import { login } from '../../shared/auth/api'
import { persistSession } from '../../shared/auth/session'
import { useSyncStatus } from '../../shared/sync/SyncProvider'

// Feature 83: rediseño del login mobile (mapa de lotes + emblema de dominios).
// Solo login; las cuentas las gestiona el administrador del establecimiento.
const ICON_GANADERIA = require('../../assets/images/login/icono1-sm.png')
const ICON_AGRICULTURA = require('../../assets/images/login/icono2-sm.png')
const ICON_GESTION = require('../../assets/images/login/icono3-sm.png')

// Segmentos de la franja superior (emula el gradiente del diseño sin libs extra).
const STRIP = ['#b45309', '#ffb84d', '#9fe870', '#4d7c0f', '#0891b2']

export default function LoginScreen() {
  const router = useRouter()
  const { syncNow } = useSyncStatus()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setError(null)
    if (!email.trim() || !password.trim()) {
      setError('Email y contraseña son obligatorios.')
      return
    }
    setIsSubmitting(true)
    try {
      const session = await login({ email: email.trim(), password })
      await persistSession(session)
      // Feature 39: si la cuenta usa la contraseña inicial, forzar el cambio antes de entrar.
      if (session.user.mustChangePassword) {
        router.replace('/(auth)/cambiar-password' as never)
      } else {
        router.replace('/(tabs)')
        void syncNow()
      }
    } catch {
      setError('No se pudo iniciar sesión con esas credenciales.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
          {/* ---- Hero: mapa de lotes + emblema ---- */}
          <View style={styles.hero}>
            <View style={styles.lotes} pointerEvents="none">
              <View style={[styles.tile, { top: -30, left: -20, width: 180, height: 150, backgroundColor: 'rgba(77,124,15,0.5)', borderColor: 'rgba(159,232,112,0.22)' }]} />
              <View style={[styles.tile, { top: -40, right: -30, width: 210, height: 170, backgroundColor: 'rgba(77,124,15,0.35)', borderColor: 'rgba(159,232,112,0.18)' }]} />
              <View style={[styles.tile, { top: 90, left: 60, width: 200, height: 160, backgroundColor: 'rgba(77,124,15,0.6)', borderColor: 'rgba(159,232,112,0.28)' }]} />
              <View style={[styles.tile, { top: 40, right: 40, width: 120, height: 130, backgroundColor: 'rgba(180,83,9,0.26)', borderColor: 'rgba(180,83,9,0.3)' }]} />
              <View style={[styles.tile, { top: 150, left: -40, width: 130, height: 150, backgroundColor: 'rgba(8,145,178,0.16)', borderColor: 'rgba(8,145,178,0.3)' }]} />
              <View style={[styles.tile, { top: 160, right: -20, width: 160, height: 150, backgroundColor: 'rgba(77,124,15,0.4)', borderColor: 'rgba(159,232,112,0.2)' }]} />
            </View>

            <SafeAreaView edges={['top']} style={styles.chips}>
              <View style={[styles.chip, styles.chipGreen]}><View style={[styles.dot, { backgroundColor: '#9fe870' }]} /><Text style={styles.chipGreenText}>L-12 · Soja</Text></View>
              <View style={[styles.chip, styles.chipAmber]}><View style={[styles.dot, { backgroundColor: '#ffb84d' }]} /><Text style={styles.chipAmberText}>Potrero 4</Text></View>
            </SafeAreaView>

            <View style={styles.heroFade} pointerEvents="none" />

            <View style={styles.emblem}>
              <View style={styles.emblemItem}>
                <Image source={ICON_GANADERIA} style={{ width: 60, height: 60 }} resizeMode="contain" />
                <Text style={styles.emblemLabel}>Ganadería</Text>
              </View>
              <View style={styles.emblemLine} />
              <View style={styles.emblemItem}>
                <Image source={ICON_AGRICULTURA} style={{ width: 80, height: 80 }} resizeMode="contain" />
                <Text style={[styles.emblemLabel, styles.emblemLabelActive]}>Agricultura</Text>
              </View>
              <View style={styles.emblemLine} />
              <View style={styles.emblemItem}>
                <Image source={ICON_GESTION} style={{ width: 60, height: 60 }} resizeMode="contain" />
                <Text style={styles.emblemLabel}>Gestión</Text>
              </View>
            </View>
          </View>

          {/* ---- Card ---- */}
          <View style={styles.card}>
            <View style={styles.strip} pointerEvents="none">
              {STRIP.map((color) => (<View key={color} style={[styles.stripSeg, { backgroundColor: color }]} />))}
            </View>

            <View style={styles.heading}>
              <Text style={styles.title}>Ingresar</Text>
              <Text style={styles.subtitle}>Accedé con tu cuenta para ver lotes, rodeos y órdenes del día.</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.control}>
                <Mail size={18} color="#9fe870" strokeWidth={1.8} style={styles.controlIcon} />
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="nombre@establecimiento.com"
                  placeholderTextColor="#5E6B85"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.control}>
                <Lock size={18} color="#9fe870" strokeWidth={1.8} style={styles.controlIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48 }]}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholder="••••••••"
                  placeholderTextColor="#5E6B85"
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)} accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? <EyeOff size={18} color="#94a3b8" strokeWidth={1.8} /> : <Eye size={18} color="#94a3b8" strokeWidth={1.8} />}
                </Pressable>
              </View>
            </View>

            {error && (
              <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
            )}

            <Pressable style={[styles.submit, isSubmitting && styles.submitDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={styles.submitText}>{isSubmitting ? 'Procesando...' : 'Entrar'}</Text>
            </Pressable>

            <Pressable onPress={() => setShowHelp((v) => !v)} style={styles.forgotWrap}>
              <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            <View style={styles.helpPill}>
              <HelpCircle size={16} color="#ffb84d" strokeWidth={1.8} />
              <Text style={styles.helpText}>¿Necesitás ayuda?</Text>
              <Pressable onPress={() => setShowHelp((v) => !v)}><Text style={styles.helpLink}>Contactar</Text></Pressable>
            </View>

            {showHelp && (
              <Text style={styles.helpNote}>Las cuentas y contraseñas las gestiona el administrador de tu establecimiento.</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#070d19' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },

  hero: { height: 330, position: 'relative', backgroundColor: '#0b1220', overflow: 'hidden' },
  lotes: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transform: [{ rotate: '-8deg' }, { scale: 1.15 }] },
  tile: { position: 'absolute', borderRadius: 8, borderWidth: 1 },
  heroFade: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: 160,
    backgroundColor: 'rgba(11,18,32,0.65)',
  },
  chips: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, borderWidth: 1, backgroundColor: 'rgba(11,18,32,0.82)' },
  chipGreen: { borderColor: 'rgba(159,232,112,0.3)' },
  chipAmber: { borderColor: 'rgba(255,184,77,0.3)' },
  chipGreenText: { color: '#d9f99d', fontSize: 12, fontWeight: '600' },
  chipAmberText: { color: '#ffd699', fontSize: 12, fontWeight: '600' },
  dot: { width: 6, height: 6, borderRadius: 3 },

  emblem: { position: 'absolute', left: 0, right: 0, bottom: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  emblemItem: { alignItems: 'center', gap: 8 },
  emblemLine: { width: 20, height: 1, marginHorizontal: 6, marginBottom: 24, backgroundColor: 'rgba(159,232,112,0.4)' },
  emblemLabel: { fontSize: 10, color: '#8fa4c3', letterSpacing: 0.8, textTransform: 'uppercase' },
  emblemLabelActive: { color: '#d9f99d', fontWeight: '600' },

  card: {
    flex: 1, marginTop: -24, paddingHorizontal: 22, paddingTop: 32, paddingBottom: 28,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(159,232,112,0.18)',
    backgroundColor: '#0d1a33', overflow: 'hidden', gap: 18,
  },
  strip: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, flexDirection: 'row' },
  stripSeg: { flex: 1, height: 4 },

  heading: { alignItems: 'center', gap: 6 },
  title: { fontSize: 28, fontWeight: '800', color: '#f8fafc', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 21, color: '#c7d4e8', textAlign: 'center' },

  field: { gap: 8 },
  label: { fontSize: 13, color: '#c7d4e8', textTransform: 'uppercase', letterSpacing: 0.8 },
  control: { position: 'relative', justifyContent: 'center' },
  controlIcon: { position: 'absolute', left: 14, zIndex: 1 },
  input: {
    minHeight: 48, borderWidth: 1, borderColor: 'rgba(159,232,112,0.2)', borderRadius: 12,
    backgroundColor: 'rgba(77,124,15,0.1)', color: '#f8fafc', fontSize: 15,
    paddingVertical: 10, paddingLeft: 44, paddingRight: 14,
  },
  eyeBtn: { position: 'absolute', right: 4, top: 4, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },

  errorBox: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(248,113,113,0.35)', backgroundColor: 'rgba(220,38,38,0.12)', padding: 12 },
  errorText: { color: '#fca5a5', fontSize: 13, fontWeight: '600' },

  submit: {
    marginTop: 4, minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#5f9612',
    shadowColor: '#4d7c0f', shadowOpacity: 0.55, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: '#f8fafc', fontSize: 15, fontWeight: '800' },

  forgotWrap: { alignSelf: 'center' },
  forgot: { color: '#9fe870', fontSize: 13, fontWeight: '600' },

  helpPill: {
    alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(255,184,77,0.22)', backgroundColor: 'rgba(180,83,9,0.12)',
  },
  helpText: { color: '#e8c9a0', fontSize: 13 },
  helpLink: { color: '#ffb84d', fontSize: 13, fontWeight: '700' },
  helpNote: { alignSelf: 'center', textAlign: 'center', color: '#e8c9a0', fontSize: 12, lineHeight: 18, maxWidth: 320 },
})
