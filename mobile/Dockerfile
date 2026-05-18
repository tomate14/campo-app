# =============================================================
# Mobile — Expo Dev Server (Metro Bundler)
#
# Este contenedor levanta el servidor de desarrollo de Expo.
# Los dispositivos físicos y emuladores se conectan via HOST_IP.
#
# Para conectar un dispositivo:
#   1. Asegurate que HOST_IP en .env sea la IP de tu máquina
#   2. El dispositivo debe estar en la misma red Wi-Fi
#   3. Abrí Expo Go y escaneá el QR o ingresá exp://<HOST_IP>:8081
# =============================================================

FROM node:20-alpine

# Dependencias del sistema para watchman y compilación nativa
RUN apk add --no-cache \
    bash \
    git \
    python3 \
    make \
    g++

WORKDIR /app

# Instalar Expo CLI globalmente
RUN npm install -g expo-cli@latest

# Copiar manifests e instalar dependencias
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copiar el código fuente
# (en desarrollo se monta como volumen para hot-reload)
COPY . .

EXPOSE 8081 19000 19006

# Inicia el servidor en modo LAN para que los dispositivos en la red se conecten
CMD ["npx", "expo", "start", "--lan", "--port", "8081"]
