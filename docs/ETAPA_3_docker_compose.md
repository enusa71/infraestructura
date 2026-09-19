cat > ~/infraestructura/docs/ETAPA_3_docker_compose.md << 'EOFFILE'
# ETAPA 3 - Primer Docker Compose

**Fecha:** 2026-09-19  
**Servidor:** ubuntu-dev-01 (10.2.9.251)  
**Resultado:** ✅ Docker Compose con Nginx funcionando

---

## Objetivo

Entender y ejecutar un servicio mediante `docker-compose.yaml` - la receta declarativa de servicios.

## ¿Qué es Docker Compose?

Docker Compose es una herramienta que define múltiples contenedores en un archivo YAML declarativo.

### Sin Docker Compose (manual)

\`\`\`bash
docker pull nginx:latest
docker create --name web -p 8080:80 nginx:latest
docker start web
docker logs web
docker stop web
docker rm web
\`\`\`

**Problemas:**
- Muchos comandos
- Fácil equivocarse
- Difícil de reproducir
- No documenta la intención

### Con Docker Compose (declarativo)

\`\`\`yaml
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
\`\`\`

\`\`\`bash
docker compose up -d      # Todo automatizado
docker compose down        # Limpieza automática
docker compose logs web    # Ver logs
\`\`\`

**Ventajas:**
- Un archivo YAML describe todo
- Reproducible
- Fácil de entender
- Versión controlada en Git

## Estructura del archivo

### \`compose/laboratorio/docker-compose.yml\`

\`\`\`yaml
services:
  # Servicio web (Nginx)
  web:
    image: nginx:latest
    container_name: laboratorio-nginx
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
    networks:
      - laboratorio-net
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3

# Redes personalizadas
networks:
  laboratorio-net:
    driver: bridge
\`\`\`

### Explicación línea por línea

| Sección | Qué hace |
|---------|----------|
| \`services:\` | Define todos los servicios (contenedores) |
| \`web:\` | Nombre interno del servicio |
| \`image: nginx:latest\` | Imagen a usar (Nginx más reciente) |
| \`container_name: laboratorio-nginx\` | Nombre del contenedor |
| \`ports: - "8080:80"\` | Mapea puerto 8080 (host) → 80 (contenedor) |
| \`volumes: - ./html:/usr/share/nginx/html:ro\` | Monta carpeta local como solo lectura |
| \`networks: - laboratorio-net\` | Conecta a red personalizada |
| \`restart: unless-stopped\` | Reinicia si cae (excepto si se detiene explícitamente) |
| \`healthcheck:\` | Chequea salud del contenedor |
| \`test: ["CMD", "curl", "-f", "http://localhost"]\` | Ejecuta \`curl\` cada 30s |
| \`networks: - driver: bridge\` | Red aislada para contenedores |

## Ejecución y pruebas

### 1. Levantar servicio

\`\`\`bash
cd ~/infraestructura/compose/laboratorio
docker compose up -d
\`\`\`

**Resultado:**
\`\`\`
[+] up 2/2
 ✔ Network laboratorio_laboratorio-net Created
 ✔ Container laboratorio-nginx Started
\`\`\`

**Qué pasó:**
1. Docker creó la red \`laboratorio-net\`
2. Descargó imagen Nginx (si no existía)
3. Creó contenedor \`laboratorio-nginx\`
4. Lo inició en background (-d)

### 2. Verificar que está corriendo

\`\`\`bash
docker ps
\`\`\`

**Resultado:**
\`\`\`
CONTAINER ID   IMAGE          COMMAND    CREATED    STATUS
2fb795638361   nginx:latest   "..."      1min ago   Up 1m (health: starting)

PORTS                              NAMES
0.0.0.0:8080->80/tcp              laboratorio-nginx
\`\`\`

**Interpretación:**
- ✅ Contenedor activo (\`Up 1 minute\`)
- ✅ Health check iniciando (\`health: starting\`)
- ✅ Puerto 8080 del host mapeado al 80 del contenedor

### 3. Probar conexión

\`\`\`bash
curl http://localhost:8080
\`\`\`

**Resultado:**
\`\`\`html
<html>
<head>
  <title>Laboratorio Docker Compose</title>
  ...
  <h1>🐳 Docker Compose Funciona!</h1>
  <p class="status">✅ Nginx está corriendo desde docker-compose.yml</p>
...
\`\`\`

**Qué significa:**
- ✅ Nginx responde correctamente
- ✅ El volumen montó \`./html/index.html\`
- ✅ El puerto está mapeado correctamente

### 4. Ver logs

\`\`\`bash
docker logs laboratorio-nginx
\`\`\`

**Resultado (parcial):**
\`\`\`
2026/09/19 22:46:57 [notice] nginx/1.31.6
2026/09/19 22:46:57 [notice] start worker process 29
2026/09/19 22:46:57 [notice] start worker process 30
...
172.18.0.1 - - [19/Sep/2026:22:48:29 +0000] "GET / HTTP/1.1" 200 718
\`\`\`

**Interpretación:**
- ✅ Nginx inició correctamente (8 worker processes)
- ✅ Log muestra nuestra request con código 200 (éxito)
- ✅ Health check ejecutándose cada 30s (líneas con curl)

### 5. Detener servicio

\`\`\`bash
docker compose down
\`\`\`

**Resultado:**
\`\`\`
[+] down 2/2
 ✔ Container laboratorio-nginx Removed
 ✔ Network laboratorio_laboratorio-net Removed
\`\`\`

**Qué pasó:**
1. Detuvo el contenedor
2. Lo eliminó
3. Eliminó la red
4. Sistema completamente limpio

### 6. Verificar que está vacío

\`\`\`bash
docker ps
\`\`\`

**Resultado:**
\`\`\`
CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
(vacío)
\`\`\`

✅ Sistema limpio, como si nunca se hubiera levantado nada.

### 7. Levantarlo nuevamente (reproducibilidad)

\`\`\`bash
docker compose up -d
\`\`\`

**Resultado:**
\`\`\`
[+] up 2/2
 ✔ Network laboratorio_laboratorio-net Created
 ✔ Container laboratorio-nginx Started
\`\`\`

✅ **Reproducibilidad demostrada:** Con un simple comando, se levanta todo idénticamente.

## Concepto clave: Infraestructura como código

El archivo \`docker-compose.yml\` es **infraestructura como código**.

**Beneficios:**
1. ✅ Reproducible - Funciona igual en cualquier máquina
2. ✅ Versionable - Se guarda en Git
3. ✅ Documentable - El YAML es autoexplicativo
4. ✅ Automatizable - Scripts pueden ejecutar \`docker compose\`
5. ✅ Recuperable - Si se borra, Git lo restaura

### Flujo de trabajo

\`\`\`
1. Escribir docker-compose.yml
           ↓
2. Guardar en Git
           ↓
3. Ejecutar: docker compose up -d
           ↓
4. Probar servicio
           ↓
5. Si falla: revisar logs, editar YAML, repetir
           ↓
6. Cuando funciona: documentar cambios, commit en Git
\`\`\`

## Conceptos aprendidos

### Servicios

Un servicio es un contenedor definido en \`services:\`.

\`\`\`
docker-compose.yml
     ↓
  services:
     ├── web (nginx)
     ├── db (postgres) ← futura ETAPA
     └── cache (redis) ← futura ETAPA
\`\`\`

### Redes

Los servicios se comunican a través de redes.

\`\`\`
Red laboratorio-net (bridge)
    ├── web (nginx:80 interno)
    ├── db (postgres:5432 interno)
    └── cache (redis:6379 interno)
\`\`\`

Dentro de la red, pueden comunicarse por nombre:
- \`web\` → \`nginx:80\`
- \`db\` → \`postgres:5432\`

### Volúmenes

Montan carpetas del host dentro del contenedor.

\`\`\`
Host                    Contenedor
./html              →   /usr/share/nginx/html
(carpeta local)         (carpeta interna de Nginx)
\`\`\`

Sin volumen: si el contenedor muere, los datos se pierden.  
Con volumen: los datos persisten en el host.

### Health check

Verifica periódicamente si el servicio está vivo.

\`\`\`
Cada 30s:
  docker exec laboratorio-nginx curl -f http://localhost
  
  Si éxito (code 200) → healthy
  Si falla (code 500+) → unhealthy
  Si 3 fallos → contenedor marcado como unhealthy
\`\`\`

### Restart policy

Define qué hacer si el contenedor muere.

\`\`\`
restart: unless-stopped

Comportamiento:
- Si cae → reinicia automáticamente
- Si se detiene explícitamente → no reinicia
- Si se elimina → no reinicia
\`\`\`

## Próximos pasos

✅ **ETAPA 3 completa:** Docker Compose funcionando  
🎯 **ETAPA 4:** Instalar Portainer (interfaz gráfica)

---

**Última actualización:** 2026-09-19 22:49 UTC
EOFFILE

