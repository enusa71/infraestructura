# 📊 Dashboard de Arquitectura - Guía de Uso

**Versión:** 1.0.0  
**Fecha:** 2026-09-12  
**Ambiente:** Desarrollo & Producción

---

## 🚀 Inicio Rápido

### 1. Ejecutar el script de setup
```bash
npm run setup:dashboard
```

### 2. Iniciar el servidor
```bash
npm run dev
```

### 3. Abrir el dashboard
```
http://localhost:3002/dashboard
```

---

## ✨ Características

### Monitoreo en Tiempo Real
- 🟢 **Online** - Servicio respondiendo correctamente
- 🔴 **Offline** - Servicio no responde
- ⚪ **Unknown** - No se ha verificado aún

### Actualización Automática
- Verifica cada **5 segundos**
- No requiere actualizar manualmente la página
- Muestra hora de última verificación

### Servicios Organizados
- **Servicios Críticos** (🚨) - Requeridos para funcionar
- **Servicios Complementarios** (ℹ️) - Opcionales o útiles

### Información Detallada
- Nombre del servicio
- Tipo (aplicación, BD, storage, etc.)
- Puerto (si aplica)
- URL de desarrollo
- Health check URL
- Estado y última verificación

---

## 📋 SERVICIOS-GLOBAL.json

Este archivo es la **fuente de verdad** del dashboard.

### Ubicación
```
/SERVICIOS-GLOBAL.json
```

### Estructura Básica
```json
{
  "timestamp": "2026-09-12T10:00:00Z",
  "version": "1.0.0",
  "ambiente": "desarrollo",
  
  "config_monitoreo": {
    "intervalo_verificacion_ms": 5000,
    "timeout_ms": 3000
  },
  
  "servicios_compartidos": {
    "postgresql": {
      "id": "postgresql",
      "nombre": "Base de Datos PostgreSQL",
      "host": "localhost",
      "puerto": 5432,
      "healthCheckUrl": "tcp://localhost:5432",
      "critico": true
    },
    "gotenberg": {
      "id": "gotenberg",
      "nombre": "Generador de PDFs",
      "host": "localhost",
      "puerto": 3001,
      "healthCheckUrl": "http://localhost:3001/health",
      "critico": false
    }
  },
  
  "aplicaciones": [
    {
      "id": "custodia",
      "nombre": "Custodia de Herramientas",
      "puerto": 3002,
      "healthCheckUrl": "http://localhost:3002/api/health",
      "estado": "desarrollo"
    }
  ]
}
```

---

## 🔧 Agregar Nuevos Servicios

### Paso 1: Editar SERVICIOS-GLOBAL.json
```json
{
  "servicios_compartidos": {
    "nuevo_servicio": {
      "id": "nuevo_servicio",
      "nombre": "Mi Nuevo Servicio",
      "host": "localhost",
      "puerto": 9000,
      "healthCheckUrl": "http://localhost:9000/health",
      "tipo": "service",
      "critico": false
    }
  }
}
```

### Paso 2: Recarga el navegador
El dashboard leerá automáticamente el JSON actualizado y empezará a verificar el nuevo servicio.

### Paso 3: Verifica el estado
El nuevo servicio aparecerá en el dashboard en la próxima verificación (máximo 5 segundos).

---

## 🔍 Health Checks

### ¿Cómo funciona?
1. El dashboard lee `SERVICIOS-GLOBAL.json`
2. Para cada servicio, hace una solicitud a su `healthCheckUrl`
3. Si obtiene respuesta exitosa (200) → 🟢 Online
4. Si falla o timeout → 🔴 Offline

### Ejemplos de Health Checks

#### API REST
```json
{
  "healthCheckUrl": "http://localhost:3002/api/health"
}
```

#### TCP (Base de Datos)
```json
{
  "healthCheckUrl": "tcp://localhost:5432"
}
```

#### URL HTTP
```json
{
  "healthCheckUrl": "http://localhost:3001/health"
}
```

---

## 🏗️ Arquitectura del Dashboard

### Componentes

1. **Dashboard Component** (`app/dashboard/page.tsx`)
   - Interfaz visual
   - Lógica de monitoreo
   - Actualización automática

2. **API Endpoint** (`app/api/servicios-config/route.ts`)
   - Lee `SERVICIOS-GLOBAL.json`
   - Retorna JSON al dashboard

3. **Health Endpoint** (`app/api/health/route.ts`)
   - Verifica conexión a BD
   - Usado por el monitoreo

4. **Config File** (`SERVICIOS-GLOBAL.json`)
   - Inventario central
   - Sin código
   - Fácil de actualizar

### Flujo
```
Dashboard (página)
    ↓
Verifica cada 5s
    ↓
Lee API /api/servicios-config
    ↓
Obtiene SERVICIOS-GLOBAL.json
    ↓
Hace health checks a cada URL
    ↓
Actualiza UI con estados
    ↓
Repite desde el paso 2
```

---

## 🎯 Casos de Uso

### Caso 1: Agregar PostgreSQL nueva
```json
{
  "id": "postgres_replica",
  "nombre": "PostgreSQL Réplica",
  "host": "replica.zfb.com",
  "puerto": 5432,
  "healthCheckUrl": "tcp://replica.zfb.com:5432",
  "critico": false
}
```

### Caso 2: Agregar app de Mantenimiento
```json
{
  "id": "mantenimiento",
  "nombre": "App Mantenimiento",
  "puerto": 3011,
  "healthCheckUrl": "http://localhost:3011/api/health",
  "estado": "desarrollo"
}
```

### Caso 3: Agregar Keycloak (cuando lo implementes)
```json
{
  "id": "keycloak",
  "nombre": "Keycloak - SSO",
  "host": "id.enusa.org",
  "puerto": 8080,
  "healthCheckUrl": "http://id.enusa.org:8080/health",
  "critico": true
}
```

---

## 📈 Escalabilidad

### Fase 1: Actual (✅ Completa)
- ✅ Dashboard de monitoreo
- ✅ Health checks básicos
- ✅ Interfaz responsive

### Fase 2: Con Keycloak
- ⏳ Agregar Keycloak a servicios compartidos
- ⏳ El dashboard lo detectará automáticamente
- ⏳ Verificará su estado en tiempo real

### Fase 3: Múltiples Apps
- ⏳ Mantenimiento (puerto 3011)
- ⏳ Reportes (puerto 3012)
- ⏳ Todas aparecerán en el dashboard

### Fase 4: Alertas
- ⏳ Notificaciones por Slack
- ⏳ Notificaciones por email
- ⏳ Historial de eventos

---

## 🚨 Troubleshooting

### El dashboard no carga
```bash
# 1. Verifica que el servidor esté corriendo
npm run dev

# 2. Verifica que la URL sea correcta
http://localhost:3002/dashboard

# 3. Abre la consola (F12) y verifica errores
```

### No se actualizan los servicios
```bash
# 1. Verifica que SERVICIOS-GLOBAL.json exista
ls SERVICIOS-GLOBAL.json

# 2. Verifica que sea JSON válido
cat SERVICIOS-GLOBAL.json | jq .

# 3. Recarga el navegador
Ctrl+Shift+R (cache duro)
```

### Los health checks fallan
```bash
# 1. Verifica que el servicio esté corriendo
curl http://localhost:3002/api/health

# 2. Verifica la URL en SERVICIOS-GLOBAL.json
grep healthCheckUrl SERVICIOS-GLOBAL.json

# 3. Prueba manualmente
curl http://localhost:5432  # BD (fallará pero eso es OK)
curl http://localhost:3001/health  # Gotenberg
```

---

## 📚 Documentación Relacionada

- [SERVICIOS-GLOBAL.json](./SERVICIOS-GLOBAL.json) - Inventario
- [ARQUITECTURA-GENERAL.md](./ARQUITECTURA-GENERAL.md) - Diagrama
- [INVESTIGACION-COMPLETA.md](./INVESTIGACION-COMPLETA.md) - Análisis
- [CLAUDE.md](./CLAUDE.md) - Instrucciones

---

## 🔗 URLs Importantes

| Página | URL |
|---|---|
| Dashboard | http://localhost:3002/dashboard |
| API Config | http://localhost:3002/api/servicios-config |
| Health Check | http://localhost:3002/api/health |
| Prisma Studio | (ejecutar `npm run db:studio`) |
| App Principal | http://localhost:3002 |

---

## 💡 Tips

1. **Bookmark el dashboard** - Acceso rápido al monitoreo
2. **Mantén SERVICIOS-GLOBAL.json actualizado** - Fuente de verdad
3. **Agrega todos tus servicios** - Aunque no sean críticos
4. **Revisa regularmente** - Detecta problemas temprano
5. **Documenta cambios** - Git track los cambios del JSON

---

## 🤝 Contribuciones

Para agregar una nueva aplicación:
1. Crea la aplicación en su puerto
2. Implementa endpoint `/api/health`
3. Agrega entrada a `SERVICIOS-GLOBAL.json`
4. Recarga el dashboard
5. Commit a Git con mensaje descriptivo

---

**Última actualización:** 2026-09-12  
**Responsable:** Equipo de Custodia  
**Contacto:** efrainnunez@gmail.com
