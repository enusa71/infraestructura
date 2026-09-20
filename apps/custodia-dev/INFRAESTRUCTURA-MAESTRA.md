# 🏗️ INFRAESTRUCTURA MAESTRA - Centro de Control
**Estado:** 2026-09-13 actualizado  
**Servidor:** srv-lab (10.1.9.250)  
**IP Pública:** 190.242.46.242  

---

## 📊 ESTADO ACTUAL DE APLICACIONES

### ✅ CUSTODIA (Entrada/Salida de Herramientas)
| Propiedad | Valor |
|-----------|-------|
| **Estado** | 🟢 FUNCIONANDO |
| **Contenedor** | custodia-app (node:20-alpine) |
| **Puerto Local** | 3002 (mapeo: 3002:3000) |
| **Directorio** | /opt/custodia-new |
| **BD** | custodia_db (custodia-postgres:5432) |
| **Gotenberg** | custodia-gotenberg:3001 |
| **Keycloak** | ✅ Configurado (realm: zfb, client: custodia-herramientas) |
| **Dominio** | custodia.enusa.org |
| **Traefik** | ✅ Configurado (pero APUNTA A PUERTO INCORRECTO - ver ⚠️) |
| **Acceso Internet** | ✅ A través de Traefik:80/443 → Cloudflare |
| **Comando** | `npm run dev` |
| **Git Repo** | github.com/enusa71/custodia-herramientas |

**✅ RESUELTO (2026-09-13):**
- Traefik ahora apunta a `http://10.1.9.250:3002` (correcto)
- Custodia funciona desde custodia.enusa.org ✅
- HTTP 200 confirmado

---

### ✅ MANTENIMIENTO (mtto)
| Propiedad | Valor |
|-----------|-------|
| **Estado** | 🟢 FUNCIONANDO (pero NO EXPUESTO) |
| **Contenedor** | mtto-staging-web-1 (mtto:20260904051831) |
| **Puerto Local** | 3000 (internal) |
| **Directorio** | /opt/mtto-staging |
| **BD** | mtto-staging-db-1 (postgres:16-alpine) |
| **Gotenberg** | mtto-staging-gotenberg-1 |
| **Keycloak** | ❓ Desconocido |
| **Dominio** | ❌ NO CONFIGURADO EN TRAEFIK |
| **Traefik** | ❌ NO TIENE ROUTER |
| **Acceso Internet** | ❌ NO ACCESIBLE |

**⚠️ PROBLEMA:**
- Mantenimiento está corriendo pero NO está expuesto a internet
- No tiene configuración en Traefik
- Si necesita acceso: CREAR router en Traefik

---

### ✅ NORMALISTA (¿es SGSI?)
| Propiedad | Valor |
|-----------|-------|
| **Estado** | 🟢 FUNCIONANDO (pero NO EXPUESTO) |
| **Contenedor** | normalista-web-1 |
| **Puerto Local** | 3000 (internal) |
| **Directorio** | /opt/normalista |
| **BD** | normalista-db-1 (postgres:16-alpine) |
| **Keycloak** | ❓ Desconocido |
| **Dominio** | ❌ NO CONFIGURADO |
| **Traefik** | ❌ NO TIENE ROUTER |
| **Acceso Internet** | ❌ NO ACCESIBLE |

**❓ ACLARACIÓN NECESARIA:** ¿Normalista = SGSI?

---

### ℹ️ OTRAS APLICACIONES

#### n8n (Automatización)
- Contenedor: n8n
- Puerto: 5678
- BD: PostgreSQL
- Status: 🟢 Corriendo
- Traefik: ❌ NO CONFIGURADO

#### Portal-Hub
- Directorio: /opt/app-portal-hub/
- Status: ❓ Desconocido
- Traefik: ❌ NO CONFIGURADO

---

## 🔗 INFRAESTRUCTURA COMPARTIDA

### Traefik (Reverse Proxy)
| Propiedad | Valor |
|-----------|-------|
| **Contenedor** | dokploy-traefik |
| **Puerto** | 80/443 (público) |
| **Status** | 🟢 Activo (33 horas) |
| **Ruters Configurados** | 2 |
| **Dominios** | custodia.enusa.org, dokploy.docker.localhost |

**Archivos de configuración:**
- `/etc/dokploy/traefik/dynamic/custodia-custodiaherramientas-ymmk7i.yml`
- `/etc/dokploy/traefik/dynamic/dokploy.yml`
- `/etc/dokploy/traefik/dynamic/middlewares.yml`

---

### Dokploy (Orquestación)
| Propiedad | Valor |
|-----------|-------|
| **Servicio** | dokploy (Docker Swarm) |
| **Puerto** | 3000 |
| **Status** | 🟢 Activo (1/1 replicas) |
| **Base de Datos** | dokploy-postgres:5432 |
| **Función** | UI de orquestación + gestión de apps |

---

### Keycloak (Autenticación)
| Propiedad | Valor |
|-----------|-------|
| **Contenedor** | keycloak-kc-1 |
| **Puerto** | 8080 (interno), 8443 (HTTPS) |
| **Status** | 🟢 Activo (3 días) |
| **Base de Datos** | keycloak-db-1 |
| **Realm Configurado** | zfb |
| **URL** | https://id.enusa.org/realms/zfb |
| **Clientes** | custodia-herramientas (activo) |
| **Traefik** | ❌ NO EXPUESTO (acceso solo interno/local) |

---

### PostgreSQL (Base de Datos)
Instancias:
1. **custodia-postgres:5432** (custodia_db)
2. **mtto-staging-db-1** (mtto)
3. **normalista-db-1** (normalista)
4. **keycloak-db-1** (keycloak)
5. **n8n-postgres** (n8n)
6. **normalista-dev-db:55432** (desarrollo)

**⚠️ PROBLEMA:** Bases de datos fragmentadas, no centralizadas

---

## 🌐 PUERTOS EN USO

```
:22    → SSH
:80    → Traefik (HTTP)
:443   → Traefik (HTTPS)
:3000  → Dokploy UI + Mantenimiento (CONFLICTO)
:3001  → Gotenberg (PDF)
:3002  → Custodia
:5432  → PostgreSQL (múltiples instancias)
:5678  → n8n
:7946  → Docker Swarm
:2377  → Docker Swarm
:8080  → Keycloak
:55432 → PostgreSQL dev
```

**⚠️ CONFLICTO:**
- Dokploy en :3000
- Mantenimiento en :3000
- ¡Pero en contenedores Docker diferentes!

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **Traefik apunta a puerto incorrecto para Custodia**
```yaml
# ACTUAL (INCORRECTO):
url: http://custodia-custodiaherramientas-ymmk7i:3003

# DEBE SER:
url: http://custodia-custodiaherramientas-ymmk7i:3002
# O si custodia está en host:
url: http://10.1.9.250:3002
```
**Impacto:** Custodia posiblemente NO funciona desde custodia.enusa.org

---

### 2. **Mantenimiento y Normalista NO están expuestos a internet**
- Corren localmente pero sin Traefik
- No tienen dominios
- No se pueden acceder desde custodia.enusa.org

---

### 3. **Keycloak NO está expuesto a internet**
- Solo accesible localmente (8080)
- URL configurada: https://id.enusa.org (¿dónde está?)

---

### 4. **Bases de datos fragmentadas**
- Cada app con su propia BD
- Sin centralización

---

## ✅ ESTADO FINAL (2026-09-13)

### Custodia - COMPLETAMENTE OPERATIVO ✅
- ✅ HTTP → Redirige a HTTPS (301)
- ✅ HTTPS → Funciona con certificado TLS (200 OK)
- ✅ custodia.enusa.org completamente accesible desde internet
- ✅ Traefik configurado para web + websecure
- ✅ Let's Encrypt certificate resolver activo

### Pendientes
- [ ] ¿Mantenimiento debe estar expuesto a internet? (crear router)
- [ ] ¿Normalista = SGSI? (confirmación del usuario)
- [ ] ¿Keycloak está accesible desde id.enusa.org?
- [ ] ¿Dónde está app-portal-hub?

---

## 📝 PROTOCOLO DE CAMBIOS SEGUROS

### ANTES de tocar cualquier cosa:
1. ✅ Leer este archivo MAESTRO
2. ✅ Identificar qué app se va a cambiar
3. ✅ Verificar TODAS sus dependencias
4. ✅ Documentar qué va a cambiar
5. ✅ HACER SOLO UN CAMBIO A LA VEZ
6. ✅ Verificar que NO rompió otras apps
7. ✅ Actualizar este archivo

### Cambios permitidos:
- ✅ Cambiar puerto de UNA app (SOLO si no afecta otras)
- ✅ Modificar env variables de UNA app
- ✅ Agregar nuevo router en Traefik (revisar conflictos)
- ✅ Cambiar BD de UNA app (si es propia)

### PROHIBIDO:
- ❌ Cambiar Traefik sin actualizar docs
- ❌ Cambiar puerto 3000 (es compartido)
- ❌ Modificar BD compartida sin avisar
- ❌ Cambiar Keycloak sin confirmar con todas las apps

---

## 📞 CONTACTO RESPONSABLES

| App | Contacto | Estado |
|-----|----------|--------|
| Custodia | efrainnunez@gmail.com | Producción |
| Mantenimiento | ? | Desarrollo |
| Normalista/SGSI | ? | Desarrollo |
| n8n | ? | Ejecutándose |
| Keycloak | ? | Configurado |

---

**Última actualización:** 2026-09-13  
**Por:** Claude (investigación automática)  
**Próximo paso:** Corregir Traefik para custodia
