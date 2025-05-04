import { Injectable } from '@angular/core';
import { Conglomerado } from '../models/conglomerado.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConglomeradoService {
  private localStorageKey = 'conglomerados';
  private papeleraKey = 'papelera';
  private conglomeradosSubject = new BehaviorSubject<Conglomerado[]>([]);
  private papeleraSubject = new BehaviorSubject<Conglomerado[]>([]);

  constructor() {
    this.loadInitialData();
  }

  // Observables para notificaciones en tiempo real
  get conglomerados$(): Observable<Conglomerado[]> {
    return this.conglomeradosSubject.asObservable();
  }

  get papelera$(): Observable<Conglomerado[]> {
    return this.papeleraSubject.asObservable();
  }

  private loadInitialData(): void {
    this.updateConglomeradosSubject();
    this.updatePapeleraSubject();
  }

  private updateConglomeradosSubject(): void {
    this.conglomeradosSubject.next(this.getConglomerados());
  }

  private updatePapeleraSubject(): void {
    this.papeleraSubject.next(this.getPapelera());
  }

  // Métodos de acceso a datos con validación mejorada
  getConglomerados(): Conglomerado[] {
    try {
      const data = localStorage.getItem(this.localStorageKey);
      return data ? this.validateConglomerados(JSON.parse(data)) : [];
    } catch (error) {
      console.error('Error parsing conglomerados:', error);
      return [];
    }
  }

  getPapelera(): Conglomerado[] {
    try {
      const data = localStorage.getItem(this.papeleraKey);
      return data ? this.validateConglomerados(JSON.parse(data)) : [];
    } catch (error) {
      console.error('Error parsing papelera:', error);
      return [];
    }
  }

  // Métodos para estado específico
  getPendingConglomerados(): Conglomerado[] {
    return this.getConglomerados().filter(c => c.estado === 'pendientes');
  }

  getConglomeradosByStatus(status: string): Conglomerado[] {
    return this.getConglomerados().filter(c => c.estado === status);
  }

  // Guardar datos con validación
  saveConglomerados(conglomerados: Conglomerado[]): void {
    if (!this.validateConglomeradoArray(conglomerados)) {
      console.error('Invalid conglomerados data');
      return;
    }
    localStorage.setItem(this.localStorageKey, JSON.stringify(conglomerados));
    this.updateConglomeradosSubject();
  }

  savePapelera(papelera: Conglomerado[]): void {
    if (!this.validateConglomeradoArray(papelera)) {
      console.error('Invalid papelera data');
      return;
    }
    localStorage.setItem(this.papeleraKey, JSON.stringify(papelera));
    this.updatePapeleraSubject();
  }

  // Métodos para actualizar listas completas
  updateConglomerados(conglomerados: Conglomerado[]): void {
    this.saveConglomerados(conglomerados);
  }

  updatePapelera(papelera: Conglomerado[]): void {
    this.savePapelera(papelera);
  }

  // Operaciones CRUD con validación
  createConglomerado(conglomerado: Conglomerado): void {
    if (!this.validateConglomerado(conglomerado)) {
      console.error('Invalid conglomerado data');
      return;
    }

    const current = this.getConglomerados();
    current.push(conglomerado);
    this.saveConglomerados(current);
  }

  updateConglomerado(updated: Conglomerado): void {
    if (!updated.id || !this.validateConglomerado(updated)) {
      console.error('Invalid update data');
      return;
    }

    const current = this.getConglomerados().map(c => 
      c.id === updated.id ? updated : c
    );
    this.saveConglomerados(current);
  }

  deleteConglomerado(id: string): void {
    const conglomerados = this.getConglomerados();
    const index = conglomerados.findIndex(c => c.id === id);
    
    if (index === -1) return;

    const [deleted] = conglomerados.splice(index, 1);
    
    if (deleted) {
      const papelera = this.getPapelera();
      papelera.push(deleted);
      this.savePapelera(papelera);
      this.saveConglomerados(conglomerados);
    }
  }

  restoreConglomerado(id: string): void {
    const papelera = this.getPapelera();
    const index = papelera.findIndex(c => c.id === id);
    
    if (index === -1) return;

    const [restored] = papelera.splice(index, 1);
    
    if (restored) {
      const conglomerados = this.getConglomerados();
      conglomerados.push(restored);
      this.saveConglomerados(conglomerados);
      this.savePapelera(papelera);
    }
  }

  deletePermanently(id: string): void {
    const papelera = this.getPapelera().filter(c => c.id !== id);
    this.savePapelera(papelera);
  }

  // Validaciones
  private validateConglomerado(conglomerado: Conglomerado): boolean {
    return !!(
      conglomerado.id &&
      conglomerado.coordenadas_centro &&
      conglomerado.departamento &&
      conglomerado.municipio &&
      conglomerado.fecha_inicio &&
      conglomerado.precision &&
      conglomerado.estado &&
      conglomerado.subparcelas
    );
  }

  private validateConglomeradoArray(conglomerados: any[]): boolean {
    return Array.isArray(conglomerados) && 
           conglomerados.every(c => this.validateConglomerado(c));
  }

  private validateConglomerados(data: any): Conglomerado[] {
    if (!Array.isArray(data)) return [];
    return data.filter(c => this.validateConglomerado(c));
  }

  // Verificar soporte de localStorage
  isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__storage__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}