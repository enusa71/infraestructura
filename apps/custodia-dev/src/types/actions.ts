export type EntradaFormData = {
  contratistaCedula: string;
  contratistaEmpresa?: string;
  herramientas: Array<{
    descripcion: string;
    cantidad: number;
  }>;
};

export type SalidaFormData = {
  custodiaId: string;
  cantidades: Record<string, number>;
};

export type EntradaResponse = {
  success: boolean;
  custodiaId: string;
  numero: string;
};

export type SalidaResponse = {
  success: boolean;
  salidaId: string;
  estado: 'CERRADA' | 'PARCIAL';
};

export type FotoResponse = {
  success: boolean;
  filename: string;
  url: string;
};
