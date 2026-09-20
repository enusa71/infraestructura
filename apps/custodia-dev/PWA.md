# 📱 PWA - Progressive Web App

## ¿Qué es PWA?

Una Progressive Web App permite que la app funcione:
- ✅ **Offline**: Funciona sin internet (fotos/datos en caché)
- ✅ **Instalable**: Se instala como app nativa en celular/tablet
- ✅ **Sincronización**: Automática cuando hay conexión
- ✅ **Rápida**: Caché de assets y lazy loading

## Características Implementadas

### 1. Service Worker (`public/service-worker.js`)
```
- Precachea assets estáticos en install
- Network-first para APIs (fallback a cache)
- Cache-first para páginas (fallback a offline)
- Background sync: sincroniza fotos cuando hay internet
```

### 2. Dexie IndexedDB (`src/lib/db.ts`)
```
- Almacena fotos offline
- Almacena firmas offline
- Almacena borradores de custodias
- Queue de sincronización
```

### 3. Indicador de Red (`src/components/NetworkStatus.tsx`)
```
- Muestra cuando está offline
- Auto-oculta cuando está online
- Activa sync background
```

### 4. Manifest.json (`public/manifest.json`)
```
- Nombre, descripción, iconos
- Shortcuts (entrada/salida rápido)
- Share target (compartir fotos)
- Screenshots para tienda
```

### 5. Registro de SW (`src/components/ServiceWorkerRegister.tsx`)
```
- Registra service worker al cargar
- Detecta actualizaciones
- Auto-refresca cuando hay nuevo SW
```

---

## Flujo Offline

### Entrada de Herramientas (Sin Internet)

```
1. Usuario está en /entrada (en portería, sin wifi)
2. Completa formulario
3. Toma fotos (se guardan en Dexie)
4. Firma (se guarda en Dexie)
5. Envía → Error "Sin conexión"
6. App guarda datos offline
7. Botón: "Pendiente de sincronizar"

[Cuando regresa internet]
8. Service Worker detecta online
9. Activa background sync
10. Sincroniza fotos → /api/fotos
11. Sincroniza custodia → /api/entrada
12. Marca como "Sincronizado"
```

### Búsqueda (Sin Internet)

```
1. Usuario busca custodia
2. Si no está en cache → "Requiere conexión"
3. Si está en cache → Muestra datos cacheados
4. Datos parciales (fotos offline)
```

---

## Instalación en Dispositivo

### Android

1. Abre en Chrome
2. Menú (⋮) → "Instalar aplicación"
3. Confirma → Se instala en home screen

### iOS

1. Abre en Safari
2. Compartir (↗) → "Añadir a pantalla de inicio"
3. Confirma → Se instala en home screen

### Desktop

1. Abre en Edge/Chrome
2. Ícono (⊞) en barra de direcciones
3. Click → "Instalar"

---

## Testing Offline

### En Chrome DevTools

1. Abre DevTools (F12)
2. Vá a **Application** → **Service Workers**
3. Check "Offline" → Simula sin internet
4. Abre `/entrada` → Funciona desde cache
5. Uncheck "Offline" → Simula conexión

### En Network Tab

```
- Assets: status 200 from (service worker)
- APIs: Red con fallback a caché
```

---

## Archivos PWA

| Archivo | Función |
|---------|---------|
| `public/service-worker.js` | Cache, sync, offline |
| `public/manifest.json` | Instalabilidad, iconos |
| `src/lib/db.ts` | Dexie, almacenamiento |
| `src/hooks/useOnline.ts` | Detector de conexión |
| `src/components/NetworkStatus.tsx` | Indicador visual |
| `src/components/ServiceWorkerRegister.tsx` | Registro del SW |
| `app/offline/page.tsx` | Página offline |

---

## Qué Falta (Fase 2)

- [ ] Iconos reales (192x192, 512x512, maskable)
- [ ] Screenshots (540x720, 1280x720)
- [ ] Push notifications
- [ ] Share target receiver
- [ ] Periodic background sync
- [ ] File handling

---

## Rendimiento

- **First Paint**: ~1s (cached)
- **Offline**: ~200ms (IndexedDB)
- **Sync**: ~10s (fotos comprimidas)

---

## Referencias

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Dexie.js](https://dexie.org/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
