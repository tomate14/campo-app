import { Stack } from 'expo-router'

// Layout del grupo de autenticacion. Sin este archivo, expo-router no reconoce
// "(auth)" como ruta propia (los screens quedaban aplanados) y el root declaraba
// <Stack.Screen name="(auth)" /> hacia una ruta inexistente. En nativo eso dejaba
// el login sin montar (pantalla negra) al redirigir sin sesion, y emitia el
// warning 'No route named "(auth)"'. Con este Stack, login y cambiar-password
// quedan registrados bajo el navegador del grupo.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
