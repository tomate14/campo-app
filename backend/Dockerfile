# =============================================================
# Backend — Multi-stage build
# Stage 1: Compilación con Maven
# Stage 2: Runtime mínimo con JRE Alpine
# =============================================================

# ---- Stage 1: Build ----
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Descargar dependencias primero (aprovecha el cache de Docker)
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

# Compilar el proyecto
COPY src ./src
RUN mvn clean package -DskipTests -B -q

# ---- Stage 2: Runtime ----
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Utilidad requerida por el healthcheck del compose
RUN apk add --no-cache curl

# Usuario no-root por seguridad
RUN addgroup -S spring && adduser -S spring -G spring

# Copiar solo el JAR generado
COPY --from=builder /app/target/*.jar app.jar

RUN chown spring:spring app.jar
USER spring

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
