# 🛠️ Custodia de Herramientas - Zona Franca Barranquilla

## Objetivo
Sistema PWA de entrada/salida de herramientas y equipos de contratistas en Zona Franca de Barranquilla.

## Stack Técnico
- **Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend:** Prisma 6.3 ORM + PostgreSQL 16 (hand-written migrations)
- **Auth:** Auth.js v5 + Keycloak OIDC (realm: zfb, client: custodia-herramientas)
- **Storage:** Cloudflare R2 (fotos de herramientas)
- **PDF:** Gotenberg (comprobantes)
- **PWA:** Dexie + Service Worker (offline support + sync queue)
- **Deployment:** Docker + Traefik + Dokploy

## Roles & Permisos
- **custodia_supervisor:** Dashboard, reportes, auditoría (server-side enforced)
- **custodia_auxiliar:** Captura entrada/salida, lectura de custodias
- **custodia_lector:** Lectura solo (reportes)

## Estructura de BD
### Tablas Principales
- **AuditLog** (append-only): Todos los cambios
- **Custodia:** Documento maestro (cédula, fecha entrada, estado)
- **CustodiaItem:** Herramientas individuales (descripción, cantidad)
- **CustodiaIngreso:** Fotos + firma de entrada
- **CustodiaSalida:** Fotos + firma de salida (parcial/total)
- **Contratista:** Datos de personas (cédula, nombre, empresa)

## Procesos Clave

### ENTRADA
1. Auxiliar en tablet captura: Cédula + Foto facial + Herramientas
2. Sistema genera número único (ej: 215316)
3. Captura foto de grupo de herramientas
4. Firma digital (contratista + guardia)
5. Genera comprobante PDF (opcional impresión)

### SALIDA
1. Contratista regresa con número
2. Tablet busca custodia por número
3. Muestra foto de grupo original (validación visual)
4. Contratista confirma: "Sí, es mío"
5. Captura fotos de salida
6. Firma digital
7. Sistema cierra custodia (o genera pendiente si salida parcial)

## Notas de Implementación
- Keycloak realm: `zfb` (compartido con app-mantenimiento)
- Tablets compartidas en portería (login una vez, todos usan)
- PWA: Offline en portería, sync cuando hay conexión
- Fotos: Comprimidas JPEG ≤1600px en R2
- Audit log: Immutable, todas las acciones quedan registradas
- Salida parcial: Requiere decisión de método (pendiente definición)

## Contacto
Admin: efrainnunez@gmail.com
