export interface PuntoReferencia {
    tipo: string;
    azimut: string;
    distancia_horizontal: string;
  }
  
  export interface Subparcela {
    id: string;
    radio: string;
    azimut: string;
    distancia_centro: string;
    materializado: string;
    color: string;
    posicion: string;
  }
  
  export interface Conglomerado {
    id: string;
    coordenadas_centro: string;
    departamento: string;
    municipio: string;
    corregimiento?: string;
    fecha_inicio: string;
    fecha_finalizacion: string;
    aprobado_por: string;
    precision: string;
    fecha_aprobacion: string;
    estado: 'pendientes' | 'rechazados' | 'corregir' | 'aprobados' | 'eliminado';
    punto_referencia: PuntoReferencia;
    subparcelas: Subparcela[];
  }