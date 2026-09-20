# 🗄️ Base de Datos - Custodia de Herramientas

## Setup Inicial

### 1. Copiar `.env` de ejemplo

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### 2. Iniciar PostgreSQL (docker-compose)

```bash
docker-compose up -d postgres gotenberg
```

**Credenciales:**
- Usuario: `custodia`
- Contraseña: `custodia123`
- Base de datos: `custodia_db`
- Puerto: `5432`

### 3. Ejecutar migraciones

```bash
npm run db:migrate:dev
# O en producción:
npm run db:migrate
```

### 4. Sembrar datos iniciales (opcional)

```bash
npm run db:seed
```

Esto crea:
- 3 contratistas de ejemplo
- 3 custodias (1 ACTIVA, 1 CERRADA, 1 PARCIAL)
- Ingresos y salidas de ejemplo
- Registros de auditoría

---

## Scripts Disponibles

| Script | Función |
|--------|---------|
| `npm run db:migrate:dev` | Crear/aplicar migraciones (desarrollo) |
| `npm run db:migrate` | Aplicar migraciones (producción) |
| `npm run db:seed` | Sembrar datos iniciales |
| `npm run db:reset` | Borrar todo y re-aplicar (⚠️ destructivo) |
| `npm run db:studio` | Abrir Prisma Studio (UI visual) |

---

## Schema

### Tablas Principales

```
AuditLog (append-only)
├── id, table, action, recordId
├── changes (JSONB), userId, userEmail
└── createdAt (índice)

Contratista
├── id, cedula (UNIQUE), nombre
├── empresa, telefono, email
└── custodias (relación 1:many)

Custodia (maestro)
├── id, numeroConsecutivo (UNIQUE)
├── contratistaId (FK), fechaEntrada, fechaSalida
├── estado: ACTIVA | CERRADA | PARCIAL
├── items (relación 1:many)
├── ingreso (relación 1:1)
└── salidas (relación 1:many)

CustodiaItem
├── id, custodiaId (FK), descripcion, cantidad
└── fotoUrl

CustodiaIngreso (1:1 a Custodia)
├── id, custodiaId (FK, UNIQUE)
├── fotoContratista, fotoGrupoHerramientas
├── firmaContratista, firmaGuardia
└── guardiaNombre, guardiaCedula

CustodiaSalida (1:many a Custodia)
├── id, custodiaId (FK), fechaSalida
├── cantidadSalida, esParcial
├── fotoSalida, firmaContratista, firmaGuardia
├── guardiaNombre, guardiaCedula
└── observaciones
```

---

## Migraciones

### Estructura de carpeta

```
prisma/
├── migrations/
│   ├── 20260907000000_init/          ← Primera migración
│   │   └── migration.sql
│   ├── migration_lock.toml
│   └── [futuras migraciones]
├── schema.prisma                      ← Definición de schema
├── seed.ts                            ← Datos iniciales
└── README.md
```

### Crear nueva migración

```bash
npm run db:migrate:dev --name agregar_nuevo_campo
# Editar schema.prisma
# Prisma detecta cambios y genera SQL automáticamente
```

---

## Notas Importantes

⚠️ **AuditLog es append-only**: Nunca se borra, solo se lee.

✅ **Relaciones con borrado en cascada**: Si borras Custodia, se borran Items, Ingreso y Salidas.

✅ **Índices optimizados**: Búsquedas frecuentes (estado, cedula, fecha) tienen índices.

✅ **JSONB para flexibilidad**: AuditLog.changes permite auditoría detallada.

---

## Troubleshooting

### Error: `role "custodia" does not exist`

```bash
# Verifica que postgres esté corriendo
docker ps | grep postgres

# Si no está, inicia nuevamente
docker-compose up -d postgres
```

### Error: `prisma: command not found`

```bash
# Instala Prisma localmente
npm install -D prisma
# O ejecuta con npx
npx prisma migrate dev
```

### Resetear todo (⚠️ destructivo)

```bash
npm run db:reset
# Esto: borra BD → re-aplica todas las migraciones → siembra datos
```

---

## Links Útiles

- [Documentación Prisma](https://www.prisma.io/docs/)
- [Prisma CLI Commands](https://www.prisma.io/docs/reference/api-reference/command-reference)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
