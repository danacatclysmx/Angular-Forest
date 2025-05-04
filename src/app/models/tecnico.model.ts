// tecnico.models.ts

export interface Conglomerado {
    id: string;
    nombre?: string;
    departamento?: string;
    municipio?: string;
    estado: string;
    testator?: string;
    [key: string]: any; // Para propiedades adicionales
  }
  
  export interface Muestra {
    id: string;
    codigo: string;
    conglomerado: string;
    tipo?: string;
    fechaRecoleccion: string;
    azimut?: string;
    distancia?: string;
    profundidad?: string;
    colorSuelo?: string;
    pesoFresco?: string;
    analisis: string[];
    observaciones?: string;
    fechaRegistro: string;
  }
  
  export interface Ruta {
    id: string;
    codigo: string;
    conglomerado: string;
    fecha: string;
    estado: number;
    tiempoEstimado?: string;
    fechaRecoleccion?: string;
    fechaEnvio?: string;
    fechaEnRuta?: string;
    fechaEntrega?: string;
  }
  
  export interface PapeleraItem {
    id: string;
    tipo: 'conglomerado' | 'muestra' | 'ruta';
    estado?: string;
    codigo?: string;
    conglomerado?: string;
    fecha?: string;
    [key: string]: any;
  }
  
  export type SeccionTecnico = 'conglomerados' | 'muestras' | 'rutas' | 'papelera';