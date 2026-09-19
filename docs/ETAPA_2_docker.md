el documento a Ubuntu:

cat > ~/infraestructura/docs/ETAPA_2_docker.md << 'EOF'
# ETAPA 2 - Instalar Docker

**Fecha:** 2026-09-19  
**Servidor:** ubuntu-dev-01 (10.2.9.251)  
**Resultado:** ✅ Docker 29.1.3 instalado y funcionando

---

## Objetivo

Instalar Docker como motor de contenedores en Ubuntu 24.04, comprendiendo su rol en la arquitectura.

## ¿Qué es Docker?

Docker es un **motor de contenedores** que permite ejecutar aplicaciones de forma aislada y reproducible.

**Sin Docker:**

Ubuntu
├── PostgreSQL (instalado directamente)
├── Keycloak (instalado directamente)
├── Nginx (instalado directamente)
└── Caos de dependencias


**Con Docker:**

Ubuntu
└── Docker
├── Contenedor PostgreSQL (aislado)
├── Contenedor Keycloak (aislado)
└── Contenedor Nginx (aislado)


Cada contenedor es como una "mini máquina" con su propio:
- Sistema operativo mínimo
- Librerías necesarias
- Aplicación
- Aislamiento de red y procesos

## Instalación

### Paso 1: Actualizar repositorios

```bash
sudo apt update

Resultado esperado:

Descargados 3.090 kB en 3s
Todos los paquetes están actualizados.
Paso 2: Limpiar conflictos previos

Se encontró que Docker CE estaba parcialmente instalado con versiones conflictivas.

sudo apt remove -y containerd.io
sudo apt autoremove -y
Paso 3: Instalar Docker
sudo apt install -y docker.io

Dependencias instaladas:

docker.io (29.1.3) - El motor principal
containerd (2.2.1) - Runtime de contenedores (bajo Docker)
runc (1.3.4) - Motor de ejecución de contenedores
bridge-utils - Herramientas de redes para contenedores
dnsmasq-base - DNS para contenedores
ubuntu-fan - Network virtual para Docker
pigz - Compresión paralela para imágenes

Total descargado: 73.7 MB

Paso 4: Verificar instalación
sudo systemctl status docker

Resultado:

● docker.service - Docker Application Container Engine
     Active: active (running) since Sat 2026-09-19 21:57:33 UTC
   Main PID: 19086

Versión:

docker --version

Resultado:

Docker version 29.1.3, build 29.1.3-0ubuntu3~24.04.2
Test: Hello World
Ejecución
docker run hello-world
¿Qué pasó?
Búsqueda local: Docker buscó la imagen hello-world:latest en local
Unable to find image 'hello-world:latest' locally
Descarga: No la encontró, así que la descargó desde Docker Hub
latest: Pulling from library/hello-world
4f55086f7dd0: Pull complete
d5e71e642bf5: Download complete
Status: Downloaded newer image for hello-world:latest
Creación: Docker creó un contenedor a partir de esa imagen
Ejecución: Ejecutó el contenedor, que mostró un mensaje y terminó
Salida: El contenedor terminó exitosamente (código 0)
Resultado
Hello from Docker!
This message shows that your installation appears to be working correctly.
Conceptos Clave Aprendidos
Imagen vs Contenedor
Concepto	Analogía	Ejemplo
Imagen	Plano/molde	hello-world:latest
Contenedor	Casa construida desde plano	El contenedor que ejecutamos

Una imagen es como una foto de un sistema operativo completo.
Un contenedor es una instancia en ejecución de esa imagen.

Imagen hello-world
    ↓
    ├── Contenedor 1 (ejecutándose)
    ├── Contenedor 2 (detenido)
    └── Contenedor 3 (ejecutándose)
Registry (Repositorio de imágenes)

Docker Hub es un repositorio público donde están las imágenes.

docker run hello-world
         ↓
    ¿Existe localmente?
    │
    ├── NO → Descargar de Docker Hub
    │        └── Imagen descargada
    │
    └── SÍ → Usar local
Ciclo de vida de un contenedor
1. CREAR (pull image + create container)
2. EJECUTAR (run)
3. DETENER (stop) ← opcional
4. ELIMINAR (rm) ← opcional

El contenedor hello-world que ejecutamos ya terminó, pero sigue existiendo en el sistema.

Ver contenedores
Contenedores activos
docker ps

(Mostrará solo contenedores en ejecución. Está vacío porque hello-world ya terminó.)

Todos los contenedores (activos y detenidos)
docker ps -a

Resultado:

CONTAINER ID   IMAGE         COMMAND    CREATED          STATUS
ffa7efa28a5e   hello-world   "/hello"   39 seconds ago   Exited (0)

NAMES
magical_jepsen

Interpretación:

CONTAINER ID: Identificador único (ffa7efa28a5e)
IMAGE: Imagen usada (hello-world)
COMMAND: Comando ejecutado (/hello)
CREATED: Cuándo se creó
STATUS: Exited (0) = Terminó correctamente
NAMES: Nombre que Docker asignó automáticamente (magical_jepsen)
Próximos pasos

✅ ETAPA 2 completa: Docker instalado y probado
📋 ETAPA 3: Crear primer docker-compose.yaml sencillo
🎯 ETAPA 4: Instalar Portainer para interfaz gráfica

Última actualización: 2026-09-19 21:57 UTC
EOF


Luego commit y push:

```bash
cd ~/infraestructura
git add docs/ETAPA_2_docker.md
git commit -m "docs: ETAPA 2 - Instalar Docker (29.1.3) y test hello-world"
git push origin main

¿Va? 👍

dale

Perfecto. Ejecuta los comandos en Ubuntu 👇

cuales comandos

Primero, copia el documento (usa nano):

nano ~/infraestructura/docs/ETAPA_2_docker.md
Se abre el editor
Pega todo el contenido de arriba ⬆️ (desde # ETAPA 2 - Instalar Docker hasta el final)
Presiona Ctrl+X
Escribe Y
Presiona Enter

Una vez hecho, ejecuta:
