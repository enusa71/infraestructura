# ETAPA 4 - Instalar Portainer

**Fecha:** 2026-09-19  
**Servidor:** ubuntu-dev-01 (10.2.9.251)  
**Resultado:** ✅ Portainer CE instalado y funcionando

---

## Objetivo

Instalar **Portainer CE** (Community Edition) como interfaz gráfica web para administrar Docker de forma visual.

## ¿Qué es Portainer?

Portainer es una interfaz gráfica que permite:

- ✅ Ver contenedores activos con estado (🟢 healthy, 🟡 starting, 🔴 unhealthy)
- ✅ Ver logs en tiempo real
- ✅ Consultar métricas (CPU, RAM, red)
- ✅ Iniciar/parar/reiniciar/eliminar contenedores
- ✅ Ver redes y volúmenes
- ✅ Acceder a terminal del contenedor
- ✅ Gestionar imágenes
- ✅ Monitorización

### Sin Portainer (CLI)

\`\`\`bash
docker ps                          # Listar contenedores
docker logs -f nombre              # Ver logs
docker stats nombre                # Ver recursos
docker exec -it nombre bash        # Entrar al contenedor
docker inspect nombre              # Ver detalles
\`\`\`

**Problemas:**
- Requiere recordar comandos
- Información en texto plano
- Difícil ver estado general de un vistazo
- No hay visualización de estado en tiempo real

### Con Portainer (GUI)

\`\`\`
http://localhost:9000
    ↓
    Interfaz web colorida
    ├── Dashboard con estado general
    ├── Contenedores (cards con botones)
    ├── Logs en tiempo real
    ├── Métricas en gráficos
    ├── Terminal integrada
    └── Gestión visual de recursos
\`\`\`

**Ventajas:**
- ✅ Todo visual
- ✅ Botones para acciones
- ✅ Estado de un vistazo
- ✅ Ideal para administración
- ✅ Ideal para aprender

## Arquitectura: Cómo funciona Portainer

Portainer es un **contenedor especial** que tiene acceso a Docker.

\`\`\`
┌───────────────────────────────────────────┐
│            UBUNTU 24.04                   │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │          DOCKER                     │  │
│  │                                     │  │
│  │  ┌──────────────────────────────┐  │  │
│  │  │    laboratorio-net           │  │  │
│  │  │                              │  │  │
│  │  │  ┌──────┐      ┌──────────┐ │  │  │
│  │  │  │Nginx │      │Portainer │ │  │  │
│  │  │  │      │      │          │ │  │  │
│  │  │  └──────┘      └─────┬────┘ │  │  │
│  │  └────────────────────────┼─────┘  │  │
│  │                           │        │  │
│  │  ┌───────────────────────┴─────┐  │  │
│  │  │ /var/run/docker.sock        │  │  │
│  │  │ (Socket de control Docker)  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └─────────────────────────────────────┘  │
│                                           │
└───────────────────────────────────────────┘
         ↓
    http://localhost:9000
    (Interfaz web)
\`\`\`

**Punto clave:** Portainer accede a Docker a través de \`/var/run/docker.sock\`.

Este socket permite que Portainer:
- Vea todos los contenedores
- Vea todas las redes
- Vea todos los volúmenes
- Control total sobre Docker

## Instalación en docker-compose.yml

### Servicio agregado

\`\`\`yaml
services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: laboratorio-portainer
    ports:
      - "9000:9000"
      - "8443:8443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer-data:/data
    networks:
      - laboratorio-net
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/api/system"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  portainer-data:
\`\`\`

### Explicación de configuración

| Campo | Qué hace |
|-------|----------|
| \`image: portainer/portainer-ce:latest\` | Portainer Community Edition (gratis) |
| \`ports: - "9000:9000"\` | Web UI en puerto 9000 |
| \`ports: - "8443:8443"\` | HTTPS en puerto 8443 (opcional) |
| \`/var/run/docker.sock:/var/run/docker.sock\` | **Crítico:** Acceso a Docker |
| \`portainer-data:/data\` | Volumen para guardar configuración |
| \`restart: unless-stopped\` | Reinicia si cae |
| \`healthcheck\` | Verifica salud cada 30s |

## Ejecución

### 1. Levantar Portainer

\`\`\`bash
cd ~/infraestructura/compose/laboratorio
docker compose up -d
\`\`\`

**Resultado:**
\`\`\`
[+] up 13/13
 ✔ Image portainer/portainer-ce:latest Pulled (4.9s)
 ✔ Container laboratorio-nginx Running
 ✔ Volume laboratorio_portainer-data Created
 ✔ Container laboratorio-portainer Started
\`\`\`

### 2. Verificar que está corriendo

\`\`\`bash
docker ps
\`\`\`

**Resultado:**
\`\`\`
CONTAINER ID   IMAGE                        COMMAND    STATUS
14da059be20a   portainer/portainer-ce      "/port"    Up 36s (health: starting)
a3d58133f2b2   nginx:latest                "/docker"  Up 15m (healthy)

PORTS
0.0.0.0:9000->9000/tcp, 0.0.0.0:8443->8443/tcp
0.0.0.0:8080->80/tcp

NAMES
laboratorio-portainer
laboratorio-nginx
\`\`\`

✅ **Ambos contenedores activos:**
- Portainer en puerto 9000
- Nginx en puerto 8080

### 3. Acceder a Portainer

Abre en el navegador:

\`\`\`
http://localhost:9000
\`\`\`

**Primera vez:** Portainer pide crear usuario administrativo.

\`\`\`
Username: admin
Password: (tu contraseña)
Confirm password: (repetir)
\`\`\`

### 4. Dashboard inicial

**Después de crear usuario, verás:**

\`\`\`
┌────────────────────────────────────────────┐
│        PORTAINER DASHBOARD                 │
├────────────────────────────────────────────┤
│                                            │
│  Environments                              │
│  ├── local (tu Docker local)               │
│      Status: Connected                     │
│                                            │
│  Quick Actions                             │
│  ├── Containers    [1]                     │
│  ├── Images        [5]                     │
│  ├── Networks      [2]                     │
│  ├── Volumes       [1]                     │
│  └── Stacks        [1]                     │
│                                            │
└────────────────────────────────────────────┘
\`\`\`

## Explorando Portainer

### Ver contenedores

Menú: **Containers**

\`\`\`
laboratorio-nginx              🟢 Healthy
├── Image: nginx:latest
├── Status: Up 15 minutes
├── CPU: 0.0%
├── Memory: 12.3 MB
├── Ports: 8080:80
└── Botones: [Stop] [Restart] [Remove] [Logs] [Exec]

laboratorio-portainer          🟡 Starting
├── Image: portainer/portainer-ce:latest
├── Status: Up 36 seconds
├── CPU: 0.1%
├── Memory: 45.2 MB
├── Ports: 9000:9000, 8443:8443
└── Botones: [Stop] [Restart] [Remove] [Logs] [Exec]
\`\`\`

**Acciones disponibles:**
- 🟢 [Start] - Iniciar contenedor
- ⏸️ [Stop] - Parar contenedor
- 🔄 [Restart] - Reiniciar
- 🗑️ [Remove] - Eliminar
- 📋 [Logs] - Ver logs en tiempo real
- 💻 [Exec] - Acceder a terminal

### Ver logs

Click en contenedor → [Logs]

\`\`\`
[Portainer Logs]
2026-09-19T22:46:57Z INF Portainer 2.19.0 (latest)
2026-09-19T22:46:58Z INF Admin user created successfully
2026-09-19T22:47:01Z INF Docker endpoint connected: Unix Socket
2026-09-19T22:47:02Z INF Portainer is running and listening...
\`\`\`

Logs en tiempo real, actualización automática.

### Ver métricas

Click en contenedor → [Stats]

\`\`\`
CPU:         0.05%
Memory:      45.2 MB / 3.8 GB
Network RX:  1.2 MB
Network TX:  0.8 MB
\`\`\`

Gráficos en tiempo real.

### Ver redes

Menú: **Networks**

\`\`\`
laboratorio_laboratorio-net   bridge
├── Driver: bridge
├── Scope: local
├── Containers: 2
│   ├── laboratorio-nginx
│   └── laboratorio-portainer
└── IP Range: 172.18.0.0/16
\`\`\`

Visualizar cómo se comunican los contenedores.

### Ver volúmenes

Menú: **Volumes**

\`\`\`
laboratorio_portainer-data
├── Driver: local
├── Mountpoint: /var/lib/docker/volumes/.../data
├── Size: 2.3 MB
└── Used by: laboratorio-portainer
\`\`\`

Datos persistentes de Portainer.

## Concepto: Portainer vs Docker Compose

| Aspecto | Docker Compose | Portainer |
|---------|---|---|
| **Tipo** | CLI (comandos) | GUI (interfaz web) |
| **Qué hace** | Define y ejecuta servicios | Visualiza y administra |
| **Uso** | Desarrollo, automatización | Monitoreo, debug |
| **Complementarias** | ✅ Se usan juntas | ✅ Se usan juntas |

**Flujo real:**

\`\`\`
1. Escribir docker-compose.yml
           ↓
2. Ejecutar: docker compose up -d
           ↓
3. Abrir Portainer: http://localhost:9000
           ↓
4. Visualizar contenedores en vivo
           ↓
5. Ver logs/métricas en Portainer
           ↓
6. Si hay error: ver logs, revisar compose.yml
           ↓
7. Editar compose.yml, docker compose up -d
           ↓
8. Volver a Portainer para verificar cambios
\`\`\`

## Ventajas de tener Portainer

### 1. Dashboard unificado

Ver estado de todo de un vistazo:

\`\`\`
Nginx:        🟢 Healthy
Portainer:    🟢 Healthy
PostgreSQL:   🟢 Healthy
Keycloak:     🔴 Unhealthy
Aplicación:   🟢 Healthy
\`\`\`

**Respuesta inmediata a preguntas:**
- "¿Está todo arriba?" → Verde = sí
- "¿Qué está caído?" → Rojo = Keycloak
- "¿Qué recursos usa?" → Métricas en vivo

### 2. Debug rápido

\`\`\`
Si algo falla:
1. Abrir Portainer
2. Click en contenedor rojo
3. Ver logs últimos 100 líneas
4. Encontrar error en 10 segundos
\`\`\`

Sin Portainer:
\`\`\`
docker logs -f nombre | tail -100
(buscando manualmente en terminal)
\`\`\`

### 3. Gestión visual

Botones coloridos vs comandos memorizados:

\`\`\`
Con Portainer:          Sin Portainer:
[Stop] [Restart]        docker stop nombre
[Remove] [Logs]         docker restart nombre
[Exec] [Stats]          docker rm nombre
                        docker logs nombre
                        docker exec -it nombre bash
                        docker stats nombre
\`\`\`

## Próximos pasos

✅ **ETAPA 4 completa:** Portainer instalado y accesible  
📋 **ETAPA 5:** Git y documentación (ya hecha)  
🔧 **ETAPA 6:** PostgreSQL con persistencia  
🌐 **ETAPA 7:** Primera aplicación real

---

## Dashboard deseado (Meta)

Ahora podemos responder rápidamente:

\`\`\`
┌─────────────────────────────────┐
│   ESTADO LABORATORIO             │
├─────────────────────────────────┤
│ Ubuntu 24.04       🟢 OK         │
│ Docker             🟢 OK         │
│ Docker Compose     🟢 OK         │
│ Nginx              🟢 OK         │
│ Portainer          🟢 OK         │
│ Red laboratorio    🟢 OK         │
│ Volúmenes          🟢 OK         │
└─────────────────────────────────┘

Acceso:
- Nginx:      http://localhost:8080
- Portainer:  http://localhost:9000
\`\`\`

---

**Última actualización:** 2026-09-19 22:49 UTC
