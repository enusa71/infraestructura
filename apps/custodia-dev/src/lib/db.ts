import Dexie, { type Table } from 'dexie';

export interface Foto {
  id?: number;
  custodiaId: string;
  tipo: 'contratista' | 'herramienta' | 'grupo' | 'salida';
  dataUrl: string;
  timestamp: number;
  sincronizado: boolean;
}

export interface Firma {
  id?: number;
  custodiaId: string;
  tipo: 'contratista' | 'guardia';
  dataUrl: string;
  timestamp: number;
  sincronizado: boolean;
}

export interface CustodiaOffline {
  id?: number;
  custodiaId: string;
  numeroConsecutivo: string;
  datos: Record<string, unknown>;
  estado: 'borrador' | 'enviado' | 'confirmado';
  timestamp: number;
}

export class CustodiaDB extends Dexie {
  fotos!: Table<Foto>;
  firmas!: Table<Firma>;
  custodias!: Table<CustodiaOffline>;

  constructor() {
    super('custodia-db');
    this.version(1).stores({
      fotos: '++id, custodiaId, timestamp, sincronizado',
      firmas: '++id, custodiaId, timestamp, sincronizado',
      custodias: '++id, custodiaId, numeroConsecutivo, timestamp, estado',
    });
  }
}

export const db = new CustodiaDB();

// Utilidades para sincronización
export async function guardarFotoOffline(foto: Omit<Foto, 'id'>) {
  return db.fotos.add(foto);
}

export async function guardarFirmaOffline(firma: Omit<Firma, 'id'>) {
  return db.firmas.add(firma);
}

export async function guardarCustodiaOffline(custodia: Omit<CustodiaOffline, 'id'>) {
  return db.custodias.add(custodia);
}

export async function obtenerFotosPendientes() {
  const fotos = await db.fotos.toArray();
  return fotos.filter((f) => !f.sincronizado);
}

export async function obtenerFirmasPendientes() {
  const firmas = await db.firmas.toArray();
  return firmas.filter((f) => !f.sincronizado);
}

export async function marcarFotoSincronizada(id: number) {
  return db.fotos.update(id, { sincronizado: true });
}

export async function marcarFirmaSincronizada(id: number) {
  return db.firmas.update(id, { sincronizado: true });
}

export async function limpiarCustodia(custodiaId: string) {
  return Promise.all([
    db.fotos.where('custodiaId').equals(custodiaId).delete(),
    db.firmas.where('custodiaId').equals(custodiaId).delete(),
    db.custodias.where('custodiaId').equals(custodiaId).delete(),
  ]);
}

export async function sincronizarFotos() {
  const pendientes = await obtenerFotosPendientes();

  for (const foto of pendientes) {
    try {
      const response = await fetch('/api/fotos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foto),
      });

      if (response.ok && foto.id) {
        await marcarFotoSincronizada(foto.id);
      }
    } catch (error) {
      console.error('Error sincronizando foto:', error);
      // Reintentar más tarde
    }
  }
}
