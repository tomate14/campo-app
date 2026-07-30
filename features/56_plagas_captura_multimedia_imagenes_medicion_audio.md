# 56 - Plagas: captura multimedia (imágenes, medición y nota de audio)

## Descripción
Permitir capturar material multimedia a lo largo del flujo de plagas: fotos en
detección, aplicación y seguimiento; una herramienta de medición sobre la foto
para estimar el tamaño de la planta o del surco; y una nota de audio en el
seguimiento, reproducible desde el histórico.

## Alcance
1. **Imágenes en detección, aplicación y seguimiento** (mobile prioritario, web
   opcional): el usuario captura una o varias fotos con la cámara del dispositivo
   y quedan asociadas al registro correspondiente. Mostrarlas en el histórico.
2. **Medición sobre la foto** (tamaño de planta / ancho de surco): ver herramienta
   sugerida abajo.
3. **Nota de audio en seguimiento**: grabar audio y asociarlo al seguimiento. En
   el histórico, mostrar un ícono de "play" para reproducir la nota **solo** si el
   registro tiene audio.

## Herramienta de medición sugerida (a investigar/confirmar)
El usuario pidió investigar. Opciones, de más simple a más avanzada:
- **Objeto de referencia (recomendado por portabilidad)**: el usuario incluye un
  objeto de tamaño conocido en la foto (tarjeta, moneda, cinta) y marca dos puntos
  de referencia + la medida real; con esa escala se miden distancias sobre la
  imagen. No requiere hardware especial y funciona en Expo. Es lo más viable hoy.
- **AR (avanzado)**: ARCore Depth API en Android para medir distancias reales.
  No está disponible en Expo Go/managed sin dev-client con módulo nativo; queda
  como mejora futura.
Sugerencia: implementar el enfoque de objeto de referencia; dejar AR documentado.

## Requisitos Técnicos
- Cámara/galería: `expo-image-picker` / `expo-camera`; audio: `expo-av`.
- Almacenamiento de archivos (imágenes/audio): definir backend (storage + URL) y
  su sincronización offline (feature 24) — la subida de binarios debe contemplar
  la cola/outbox o subida diferida.
- Modelo: asociar media a detección/aplicación/seguimiento (tabla de adjuntos).
- Histórico: render de miniaturas y botón de play condicional a que exista audio.
- Estilo premium dark SaaS; íconos reales (sin siglas).

## Dependencias
- Feature 37 (plagas), 24 (offline/sincronización de adjuntos).

## Estado
Pendiente.
