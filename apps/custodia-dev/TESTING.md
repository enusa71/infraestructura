# 🧪 Testing Local - Custodia de Herramientas

## Setup Rápido (5 minutos)

### Requisitos
- Docker Desktop instalado
- Node.js 18+
- Git

### 1. Clonar repositorio

```bash
git clone https://github.com/enusa71/app-custodia-herramientas.git
cd app-custodia-herramientas
```

### 2. Setup automático (recomendado)

```bash
bash scripts/setup-local.sh
```

O manual:

```bash
# Copiar .env
cp .env.local.example .env.local

# Instalar dependencias
npm install

# Iniciar BD
docker-compose up -d postgres gotenberg

# Migraciones
npm run db:migrate:dev

# Semilla de datos
npm run db:seed

# Compilar
npm run build
```

### 3. Iniciar servidor

```bash
npm run dev
```

Abre: **http://localhost:3000**

---

## Testing Manual

### Flujo Entrada

1. **Dashboard** → "Entrada de Herramientas"
2. **Ingresa cédula:** `1098765432`
3. **Empresa:** `Construcciones Prueba`
4. **Agregar herramientas:**
   - Taladro (cantidad: 1)
   - Sierra (cantidad: 2)
5. **Registrar Entrada**
6. ✅ Ver número de custodia generado

### Flujo Salida

1. **Dashboard** → "Salida de Herramientas"
2. **Buscar custodia:** Ingresa el número anterior
3. **Validar fotos** (mockup)
4. **Cantidades a salir:**
   - Taladro: 1 (sale todo)
   - Sierra: 1 (queda 1)
5. **Confirmar Salida**
6. ✅ Ver status "Salida Parcial"

### Datos de Ejemplo

| Cédula | Nombre | Empresa |
|--------|--------|---------|
| 1098765432 | Juan Pérez García | Construcciones Pérez SAS |
| 1087654321 | María López Rodríguez | Servicios Técnicos López |
| 1076543210 | Carlos Martínez Díaz | Mantenimiento Industrial CM |

---

## Verificaciones

### ✅ Compilación

```bash
npm run build
```

Esperado: "Successfully compiled" sin errores

### ✅ Tipos TypeScript

```bash
npx tsc --noEmit
```

Esperado: Sin errores

### ✅ Linting

```bash
npm run lint
```

Esperado: Sin errores críticos

### ✅ BD Conectada

```bash
# Abrir Prisma Studio
npm run db:studio
```

Esperado: UI abre en http://localhost:5555

### ✅ Service Worker

1. Abre DevTools (F12)
2. Vá a **Application** → **Service Workers**
3. Verifica que esté registrado
4. Marca "Offline"
5. Recarga página
6. ✅ Debe cargar desde caché

---

## Troubleshooting

### Error: "Module not found"

```bash
# Limpia node_modules
rm -rf node_modules package-lock.json
npm install

# Recompila
npm run build
```

### Error: "Database connection refused"

```bash
# Verifica que postgres está corriendo
docker ps | grep postgres

# Si no está:
docker-compose up -d postgres

# Espera 10 segundos y prueba de nuevo
```

### Error: "Port 3000 already in use"

```bash
# Mata el proceso en puerto 3000
lsof -i :3000 | grep -v PID | awk '{print $2}' | xargs kill -9

# O cambia el puerto
PORT=3001 npm run dev
```

### Error: "STORAGE_DIR permission denied"

```bash
# Crea la carpeta con permisos
mkdir -p ./storage
chmod 777 ./storage
```

---

## Performance Checks

### Build Time
```bash
time npm run build
```
Objetivo: < 60 segundos

### Dev Server Start
```bash
time npm run dev
# Presiona Ctrl+C después de que inicie
```
Objetivo: < 10 segundos

### First Paint (DevTools)
1. Abre DevTools → Network
2. Recarga página
3. Revisa "First Contentful Paint" (FCP)
Objetivo: < 2 segundos (cached)

---

## Checklist Antes de Deploy

- [ ] `npm run build` sin errores
- [ ] `npm run lint` sin errores
- [ ] Service Worker registrado
- [ ] Offline mode funciona
- [ ] Entrada → Salida → Custodia completa
- [ ] BD sincroniza datos
- [ ] Fotos se comprimen
- [ ] Firmas digitales funcionan
- [ ] Auth (login) funciona
- [ ] Reportes cargana datos

---

## Logs Útiles

### Server logs

```bash
npm run dev
# Busca: [SW] Registered, [Network] Online/Offline
```

### BD logs

```bash
docker logs -f custodia-postgres
```

### Prisma Studio

```bash
npm run db:studio
# Abre en http://localhost:5555
```

---

## Links de Referencia

- Docs: [README.md](./README.md)
- PWA: [PWA.md](./PWA.md)
- BD: [prisma/README.md](./prisma/README.md)
- NextAuth: [src/auth.ts](./src/auth.ts)

---

## Contacto

Problemas: Abre issue en GitHub
Preguntas: efrainnunez@gmail.com
