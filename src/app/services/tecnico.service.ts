import { Injectable } from '@angular/core';
import { Conglomerado, Muestra, Ruta, PapeleraItem } from '../models/tecnico.model';

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
    const savedConglomerados = localStorage.getItem("conglomerados");
    const savedMuestras = localStorage.getItem("muestras");
    const savedRutas = localStorage.getItem("rutas");
    const savedPapelera = localStorage.getItem("papelera");

    this.conglomerados = savedConglomerados ? JSON.parse(savedConglomerados) : [];
    this.muestras = savedMuestras ? JSON.parse(savedMuestras) : [];
    this.rutas = savedRutas ? JSON.parse(savedRutas) : this.getRutasIniciales();
    this.papelera = savedPapelera ? JSON.parse(savedPapelera) : [];

    this.saveAllToLocalStorage();
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

  // Métodos públicos para obtener datos
  getConglomerados(): Conglomerado[] {
    return this.conglomerados;
  }

  getMuestras(): Muestra[] {
    return this.muestras;
  }

  getRutas(): Ruta[] {
    return this.rutas;
  }

  getPapelera(): PapeleraItem[] {
    return this.papelera;
  }

  // Métodos para manipular datos
  addMuestra(muestra: Muestra): void {
    this.muestras.push(muestra);
    this.saveAllToLocalStorage();
  }

  deleteMuestra(id: string): void {
    this.muestras = this.muestras.filter(m => m.id !== id);
    this.saveAllToLocalStorage();
  }

  updateRuta(ruta: Ruta): void {
    const index = this.rutas.findIndex(r => r.id === ruta.id);
    if (index !== -1) {
      this.rutas[index] = ruta;
      this.saveAllToLocalStorage();
    }
  }

  moveToTrash(id: string, type: 'conglomerado' | 'muestra' | 'ruta'): void {
    let item: any;

    switch (type) {
      case 'conglomerado':
        item = this.conglomerados.find(c => c.id === id);
        this.conglomerados = this.conglomerados.filter(c => c.id !== id);
        break;
      case 'muestra':
        item = this.muestras.find(m => m.id === id);
        this.muestras = this.muestras.filter(m => m.id !== id);
        break;
      case 'ruta':
        item = this.rutas.find(r => r.id === id);
        this.rutas = this.rutas.filter(r => r.id !== id);
        break;
    }

    if (item) {
      item.tipo = type;
      this.papelera.push(item);
      this.saveAllToLocalStorage();
    }
  }

  restoreFromTrash(id: string): void {
    const item = this.papelera.find(i => i.id === id);
    if (!item) return;

    switch (item.tipo) {
      case 'conglomerado':
        this.conglomerados.push(item as Conglomerado);
        break;
      case 'muestra':
        this.muestras.push(item as Muestra);
        break;
      case 'ruta':
        this.rutas.push(item as unknown as Ruta);
        break;
    }

    this.papelera = this.papelera.filter(i => i.id !== id);
    this.saveAllToLocalStorage();
  }
}