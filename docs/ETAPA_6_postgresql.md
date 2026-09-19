# ETAPA 6 - PostgreSQL con Persistencia

**Fecha:** 2026-09-19  
**Servidor:** ubuntu-dev-01 (10.2.9.251)  
**Resultado:** ✅ PostgreSQL 16 instalado y persistente

---

## Objetivo

Agregar **PostgreSQL 16** como servicio en docker-compose para tener una base de datos real con persistencia.

## ¿Qué es PostgreSQL?

PostgreSQL es una base de datos relacional:

- ✅ Open source
- ✅ Robusta y confiable
- ✅ Soporta transacciones ACID
- ✅ Ideal para aplicaciones reales
- ✅ Usada en Custodia

## Configuración en docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: laboratorio-postgres
    environment:
      POSTGRES_USER: custodia
      POSTGRES_PASSWORD: custodia123
      POSTGRES_DB: custodia_dev
    ports:
      - "5433:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - laboratorio-net
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U custodia"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
