# 🏗️ ARQUITECTURA - Custodia de Herramientas

**Versión:** 1.0.0  
**Última actualización:** 2026-09-12  
**Ambiente:** Desarrollo & Producción  
**Región:** Zona Franca Barranquilla

---

## 📊 DIAGRAMA DE ARQUITECTURA (Tiempo Real)

```mermaid
graph TB
    User["👥 Usuario<br/>(Tablet/Desktop)"]
    Browser["🌐 Navegador<br/>(Chrome/Safari)"]
    
    subgraph "Frontend Layer"
        App["📱 Next.js App<br/>(React 19)<br/>puerto 3002"]
        PWA["⚡ PWA<br/>(Service Worker)<br/>(Dexie - Offline)"]
    end
    
    subgraph "Backend Layer"
        API["🔌 Next.js API<br/>(Node.js)<br/>/api/*"]
        Auth["🔐 Auth.js v5<br/>(sin provider)"]
        Actions["⚙️ Server Actions<br/>(entrada, salida, etc)"]
    end
    
    subgraph "Data Layer"
        DB[("🗄️ PostgreSQL 16<br/>(custodia_db)<br/>puerto 5432")]
        Storage["📦 Storage Local<br/>(/opt/custodia/fotos)<br/>o R2"]
    end
    
    subgraph "External Services"
        Gotenberg["📄 Gotenberg<br/>(PDF Generation)<br/>puerto 3001"]
        R2["☁️ Cloudflare R2<br/>(Cloud Storage)<br/>(No implementado)"]
    end
    
    subgraph "Monitoreo"
        Dashboard["📊 Dashboard Arquitectura<br/>(Lee SERVICIOS-GLOBAL.json)"]
        HealthAPI["💚 Health Checks<br/>(/api/health)"]
    end
    
    User -->|Navega| Browser
    Browser -->|Carga| App
    App --> PWA
    App --> API
    API --> Auth
    API --> Actions
    
    Actions -->|CRUD| DB
    Actions -->|Guarda| Storage
    API -->|Consulta| DB
    
    API -->|Genera PDF| Gotenberg
    Actions -->|Sube fotos| R2
    
    Dashboard -->|Verifica cada 5s| HealthAPI
    HealthAPI -->|Consulta| DB
    Dashboard -->|Lee config| SERVICIOS["SERVICIOS-GLOBAL.json"]
    
    classDef online fill:#10b981,stroke:#059669,color:#fff
    classDef offline fill:#6b7280,stroke:#4b5563,color:#fff
    classDef service fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef data fill:#f59e0b,stroke:#d97706,color:#fff
    classDef monitoring fill:#8b5cf6,stroke:#6d28d9,color:#fff
    
    class App,API,Auth,Actions,HealthAPI online
    class PWA offline
    class Gotenberg,R2 service
    class DB,Storage data
    class Dashboard,SERVICIOS monitoring
```

---

## 🔄 FLUJOS PRINCIPALES

### Flujo 1: ENTRADA DE HERRAMIENTAS
```mermaid
sequenceDiagram
    participant User as 👤 Usuario (Tablet)
    participant App as 📱 App
    participant API as 🔌 API
    participant DB as 🗄️ PostgreSQL
    participant Storage as 📦 Storage

    User->>App: 1. Abre /entrada
    App->>App: 2. Captura cédula contratista
    App->>App: 3. Toma foto facial + fotos herramientas
    App->>App: 4. Captura firma digital
    User->>App: 5. Click "Confirmar"
    App->>API: 6. POST /entrada + fotos + firma
    API->>DB: 7. Crea Custodia + Items + Ingreso
    API->>Storage: 8. Guarda fotos comprimidas
    DB-->>API: 9. numeroConsecutivo generado
    API-->>App: 10. ✅ Éxito + PDF
    App->>User: 11. Muestra comprobante + QR
```

### Flujo 2: SALIDA DE HERRAMIENTAS
```mermaid
sequenceDiagram
    participant User as 👤 Usuario
    participant App as 📱 App
    participant API as 🔌 API
    participant DB as 🗄️ PostgreSQL

    User->>App: 1. Abre /salida
    App->>API: 2. GET /historial (custodias activas)
    API->>DB: 3. SELECT * FROM Custodia WHERE estado=ACTIVA
    DB-->>API: 4. Retorna custodias
    API-->>App: 5. Muestra tarjetas de custodias
    User->>App: 6. Selecciona custodia
    App->>App: 7. Muestra foto original + items
    User->>App: 8. Ingresa cantidades a salir + firma
    App->>API: 9. POST /salida + cantidades + firma
    API->>DB: 10. Crea CustodiaSalida + Items
    API->>DB: 11. Actualiza estado (PARCIAL o CERRADA)
    API-->>App: 12. ✅ Éxito + comprobante
    App->>User: 13. Muestra QR + opción WhatsApp
```

### Flujo 3: MONITOREO EN TIEMPO REAL
```mermaid
sequenceDiagram
    participant Dashboard as 📊 Dashboard
    participant JSON as 📄 SERVICIOS-GLOBAL.json
    participant API as 🔌 Health API
    participant DB as 🗄️ PostgreSQL

    loop Cada 5 segundos
        Dashboard->>JSON: 1. Lee SERVICIOS-GLOBAL.json
        JSON-->>Dashboard: 2. Lista de servicios + URLs
        Dashboard->>API: 3. GET /api/health
        API->>DB: 4. SELECT 1 (ping)
        alt BD responde
            DB-->>API: 5. 200 OK
            API-->>Dashboard: 6. {status: ok}
            Dashboard->>Dashboard: 7. Marca 🟢 Online
        else BD falla
            DB-->>API: 5. Error de conexión
            API-->>Dashboard: 6. {status: error}
            Dashboard->>Dashboard: 7. Marca 🔴 Offline
        end
    end
```

---

## 📋 SERVICIOS Y SU ESTADO

### Estado Actual (Dev)

| Servicio | Host | Puerto | Estado | Crítico |
|---|---|---|---|---|
| **Next.js App** | localhost | 3002 | 🟢 Desarrollo | ✅ Sí |
| **PostgreSQL** | localhost | 5432 | 🟢 Corriendo | ✅ Sí |
| **Gotenberg** | localhost | 3001 | 🟢 Corriendo | ❌ No |
| **Cloudflare R2** | cloud | - | ⚪ Deshabilitado | ❌ No |
| **Keycloak** | - | - | ⚫ No implementado | ❌ No |

### Puertos en Desarrollo
```
3002 → Next.js App (desarrollo)
3001 → Gotenberg (PDF)
5432 → PostgreSQL
```

### Puertos en Producción (srv-lab)
```
3010 → Next.js App (custodia)
3011 → Mantenimiento (futuro)
3012 → Reportes (futuro)
5432 → PostgreSQL (compartida)
8080 → Keycloak (futuro, realm: zfb)
```

---

## 🔐 SEGURIDAD Y PERMISOS

### Matriz de Roles

| Acción | admin | usuario | lector |
|---|---|---|---|
| Registrar entrada | ✅ | ✅ | ❌ |
| Registrar salida | ✅ | ✅ | ❌ |
| Ver reportes | ✅ | ✅ | ✅ |
| Ver historial | ✅ | ✅ | ✅ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Gestionar herramientas | ✅ | ❌ | ❌ |
| Ver auditoría | ✅ | ❌ | ❌ |

### Autenticación Futura (Keycloak)
```yaml
Realm: zfb
Clientes:
  - custodia-herramientas (actual)
  - app-mantenimiento (futura)
  - reportes (futura)

Roles:
  - custodia_admin / custodia_usuario / custodia_lector
  - mantenimiento_supervisor / mantenimiento_tecnico / mantenimiento_lector
  - reportes_lector
```

---

## 💾 BASE DE DATOS

### Tablas Principales

```mermaid
graph LR
    Custodia["Custodia<br/>numeroConsecutivo<br/>estado<br/>fechaEntrada<br/>fechaSalida"]
    
    Contratista["Contratista<br/>cedula<br/>nombre<br/>empresa"]
    
    CustodiaItem["CustodiaItem<br/>custodiaId<br/>herramientaId<br/>cantidad"]
    
    Herramienta["Herramienta<br/>nombre<br/>descripcion"]
    
    CustodiaIngreso["CustodiaIngreso<br/>fotos<br/>firmas<br/>datos guardia"]
    
    CustodiaSalida["CustodiaSalida<br/>fechaSalida<br/>esParcial<br/>fotos<br/>firmas"]
    
    AuditLog["AuditLog<br/>append-only<br/>table<br/>action<br/>changes"]
    
    Custodia ---|1:∞| Contratista
    Custodia ---|1:1| CustodiaIngreso
    Custodia ---|1:∞| CustodiaSalida
    Custodia ---|1:∞| CustodiaItem
    CustodiaItem ---|∞:1| Herramienta
    CustodiaSalida ---|1:∞| CustodiaItem
    
    Custodia ---|registra| AuditLog
    CustodiaSalida ---|registra| AuditLog
    CustodiaIngreso ---|registra| AuditLog
    
    classDef tabla fill:#3b82f6,stroke:#1d4ed8,color:#fff
    class Custodia,Contratista,CustodiaItem,Herramienta,CustodiaIngreso,CustodiaSalida,AuditLog tabla
```

---

## 🚀 DEPLOYMENT

### Desarrollo Local
```bash
docker-compose up -d postgres gotenberg
npm install
npm run db:migrate:dev
npm run dev
# App en http://localhost:3002
```

### Producción (srv-lab)
```bash
# Servidor: 10.1.9.250
# Servicios: Docker + Traefik
# BD: PostgreSQL 16 compartida
# Puerto: 3010 (custodia)
```

---

## 📈 MONITOREO

### Health Checks Automáticos
```bash
# Verificación cada 5 segundos
GET http://localhost:3002/api/health

# Respuesta OK:
{
  "status": "ok",
  "timestamp": "2026-09-12T10:00:00Z"
}

# Respuesta Error:
{
  "status": "error",
  "message": "Database connection failed"
}
```

### Dashboard
- Se ejecuta en `/dashboard` (próximamente)
- Lee `SERVICIOS-GLOBAL.json`
- Muestra estado en tiempo real
- Verifica cada 5 segundos

---

## 📞 ESCALABILIDAD FUTURA

### Próximas Aplicaciones
1. **Mantenimiento** (puerto 3011)
   - Dependencias: PostgreSQL, Keycloak
   - BD separada: mantenimiento_db

2. **Reportes** (puerto 3012)
   - Dashboard centralizado
   - Dependencias: PostgreSQL, Keycloak
   - BD: reportes_db

3. **Keycloak Centralizado**
   - Realm: zfb
   - Múltiples clientes
   - SSO entre apps

---

## 🔗 DEPENDENCIAS EXTERNAS

### Implementadas
- ✅ PostgreSQL 16
- ✅ Gotenberg 8
- ✅ Next.js 15
- ✅ Prisma 6.19

### Planeadas (FASE 2)
- ⏳ Keycloak (realm: zfb)
- ⏳ Cloudflare R2 (storage)
- ⏳ Gotenberg + PDF signing

### Opcionales
- ❓ Redis (caché)
- ❓ Elasticsearch (búsqueda)
- ❓ Grafana + Prometheus (monitoreo avanzado)

---

## 📚 DOCUMENTACIÓN RELACIONADA

- [SERVICIOS-GLOBAL.json](./SERVICIOS-GLOBAL.json) - Inventario centralizado
- [INVESTIGACION-COMPLETA.md](./INVESTIGACION-COMPLETA.md) - Análisis exhaustivo
- [CLAUDE.md](./CLAUDE.md) - Instrucciones para desarrollo
- [PWA.md](./PWA.md) - Features offline
- [prisma/README.md](./prisma/README.md) - Documentación BD

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Documentar arquitectura (DONE)
2. ⏳ Crear Dashboard de monitoreo
3. ⏳ Implementar Keycloak
4. ⏳ Agregar app-mantenimiento
5. ⏳ Agregar app-reportes
6. ⏳ Configurar CI/CD

---

**Última actualización:** 2026-09-12 por Claude  
**Contacto:** efrainnunez@gmail.com
