import { Injectable } from '@angular/core';
import { 
  Conglomerado, 
  Muestra, 
  Ruta, 
  PapeleraItem,
  SeccionTecnico 
} from '../models/tecnico.model';

@Injectable({
  providedIn: 'root'
})
export class TecnicoService {
  private conglomerados: Conglomerado[] = [];
  private muestras: Muestra[] = [];
  private rutas: Ruta[] = [];
  private papelera: PapeleraItem[] = [];

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.conglomerados = JSON.parse(localStorage.getItem("conglomerados") || "[]");
    this.muestras = JSON.parse(localStorage.getItem("muestras") || "[]");
    this.rutas = JSON.parse(localStorage.getItem("rutas") || "[]");
    this.papelera = JSON.parse(localStorage.getItem("papelera") || "[]");

    if (this.rutas.length === 0) {
      this.rutas = this.getRutasIniciales();
      this.saveAllToLocalStorage();
    }
  }

  private getRutasIniciales(): Ruta[] {
    return [
      {
        id: "ruta1",
        codigo: "MSTR-001",
        conglomerado: "CONG-001",
        fecha: "15/06/2023",
        estado: 1,
        fechaRecoleccion: "10/06/2023",
      },
      {
        id: "ruta2",
        codigo: "MSTR-002",
        conglomerado: "CONG-002",
        fecha: "20/06/2023",
        estado: 3,
        fechaRecoleccion: "15/06/2023",
        fechaEnvio: "16/06/2023",
        fechaEnRuta: "17/06/2023",
      },
    ];
  }

  private saveAllToLocalStorage(): void {
    localStorage.setItem("conglomerados", JSON.stringify(this.conglomerados));
    localStorage.setItem("muestras", JSON.stringify(this.muestras));
    localStorage.setItem("rutas", JSON.stringify(this.rutas));
    localStorage.setItem("papelera", JSON.stringify(this.papelera));
  }

  // Resto de métodos del servicio...
  // (Mantén los mismos métodos que en la solución anterior)
}