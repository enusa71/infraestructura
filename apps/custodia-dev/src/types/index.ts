export type UserRole = "custodia_supervisor" | "custodia_auxiliar" | "custodia_lector";

export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
}

export interface Custodia {
  id: string;
  numeroConsecutivo: string;
  contratistaId: string;
  fechaEntrada: Date;
  fechaSalida?: Date;
  estado: "ACTIVA" | "CERRADA" | "PARCIAL";
  items: CustodiaItem[];
  ingreso?: CustodiaIngreso;
  salidas: CustodiaSalida[];
}

export interface CustodiaItem {
  id: string;
  descripcion: string;
  cantidad: number;
  fotoUrl?: string;
}

export interface CustodiaIngreso {
  id: string;
  fotoContratista?: string;
  fotoGrupoHerramientas?: string;
  firmaContratista?: string;
  firmaGuardia?: string;
  guardiaNombre?: string;
}

export interface CustodiaSalida {
  id: string;
  fechaSalida: Date;
  cantidadSalida: number;
  esParcial: boolean;
  fotoSalida?: string;
  firmaContratista?: string;
  firmaGuardia?: string;
}

export interface Contratista {
  id: string;
  cedula: string;
  nombre: string;
  empresa?: string;
  telefono?: string;
  email?: string;
}
