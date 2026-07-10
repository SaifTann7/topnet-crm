# =============================================================================
# TOPNET CRM — Spring Boot Production Dockerfile
# Multi-stage build: Maven compile → JRE runtime
# =============================================================================

# --- Build stage ---
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B -q

COPY src ./src
RUN mvn package -DskipTests -B -q

# --- Runtime stage ---
FROM eclipse-temurin:21-jre-alpine AS runtime

LABEL maintainer="TOPNET CRM"
LABEL description="TOPNET CRM Spring Boot API"

WORKDIR /app

RUN apk add --no-cache curl \
    && addgroup -S topnet \
    && adduser -S topnet -G topnet

COPY --from=build /app/target/topnet-crm-*.jar app.jar
COPY scripts/apm-discover.sh /usr/local/bin/apm-discover.sh
RUN chown topnet:topnet app.jar \
    && chmod +x /usr/local/bin/apm-discover.sh

USER topnet

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD curl -sf http://localhost:8080/actuator/health/readiness || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
