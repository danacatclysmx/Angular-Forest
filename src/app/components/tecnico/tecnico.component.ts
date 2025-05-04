import { Component, OnInit, AfterViewInit } from '@angular/core';
import { TecnicoService } from '../../services/tecnico.service';
import { Conglomerado, Muestra, Ruta, PapeleraItem } from '../../models/tecnico.model';

@Component({
  selector: 'app-tecnico',
  templateUrl: './tecnico.component.html',
  styleUrls: ['./tecnico.component.css']
})
export class TecnicoComponent implements OnInit, AfterViewInit {
  currentSection: 'conglomerados' | 'muestras' | 'rutas' | 'papelera' = 'conglomerados';
  filteredStatus: string = 'pendientes';
  
  conglomerados: Conglomerado[] = [];
  muestras: Muestra[] = [];
  rutas: Ruta[] = [];
  papelera: PapeleraItem[] = [];
  
  nuevaMuestra: Muestra = {
    id: '',
    codigo: '',
    conglomerado: '',
    fechaRecoleccion: '',
    analisis: [],
    fechaRegistro: ''
  };

  constructor(private tecnicoService: TecnicoService) {}

  ngOnInit(): void {
    this.loadData();
    this.generateSampleCode();
  }

  ngAfterViewInit(): void {
    this.setupEventListeners();
  }

  loadData(): void {
    this.conglomerados = this.tecnicoService.getConglomerados();
    this.muestras = this.tecnicoService.getMuestras();
    this.rutas = this.tecnicoService.getRutas();
    this.papelera = this.tecnicoService.getPapelera();
  }

  filterConglomerados(status: string): void {
    this.filteredStatus = status;
  }

  changeSection(section: 'conglomerados' | 'muestras' | 'rutas' | 'papelera'): void {
    this.currentSection = section;
    if (section === 'muestras') {
      this.generateSampleCode();
    }
  }

  generateSampleCode(): void {
    this.nuevaMuestra.codigo = "MUES_" + Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  guardarMuestra(): void {
    this.nuevaMuestra.id = Date.now().toString();
    this.nuevaMuestra.fechaRegistro = new Date().toISOString();
    
    this.tecnicoService.addMuestra(this.nuevaMuestra);
    this.muestras = this.tecnicoService.getMuestras();
    
    // Reset form
    this.nuevaMuestra = {
      id: '',
      codigo: this.nuevaMuestra.codigo,
      conglomerado: '',
      fechaRecoleccion: '',
      analisis: [],
      fechaRegistro: ''
    };
    this.generateSampleCode();
  }

  eliminarMuestra(id: string): void {
    if (confirm("¿Estás seguro de eliminar esta muestra?")) {
      this.tecnicoService.deleteMuestra(id);
      this.muestras = this.tecnicoService.getMuestras();
    }
  }

  deleteItem(id: string, type: 'conglomerado' | 'muestra' | 'ruta'): void {
    if (confirm(`¿Estás seguro de eliminar este ${type}?`)) {
      this.tecnicoService.moveToTrash(id, type);
      this.loadData();
    }
  }

  restoreItem(id: string): void {
    this.tecnicoService.restoreFromTrash(id);
    this.loadData();
  }

  updateRutaEstado(ruta: Ruta, newEstado: number): void {
    ruta.estado = newEstado;
    this.tecnicoService.updateRuta(ruta);
  }

  private setupEventListeners(): void {
    // Toggle sidebar
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (menuToggle && sidebar && overlay) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        menuToggle.classList.toggle('open');
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        menuToggle.classList.remove('open');
      });
    }
  }
}