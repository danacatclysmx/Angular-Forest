import { 
  Component, 
  OnInit, 
  AfterViewInit, 
  ViewChild, 
  ElementRef, 
  Renderer2, 
  OnDestroy,
  ChangeDetectorRef 
} from '@angular/core';
import { Conglomerado, PuntoReferencia, Subparcela } from '../../models/conglomerado.model';
import { ConglomeradoService } from '../../services/conglomerado.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-jefe',
  templateUrl: './jefe.component.html',
  styleUrls: ['./jefe.component.css'],
  host: { 
    '(document:click)': 'onDocumentClick($event)' 
  }
})
export class JefeComponent implements OnInit, AfterViewInit, OnDestroy {
  // ViewChild declarations with definite assignment assertion
  @ViewChild('map') mapContainer?: ElementRef<HTMLElement>;
  @ViewChild('menuToggle') menuToggle!: ElementRef;
  @ViewChild('sidebar') sidebar!: ElementRef;
  @ViewChild('overlay') overlay!: ElementRef;
  @ViewChild('createButton') createButton!: ElementRef;
  @ViewChild('statusTabs') statusTabs!: ElementRef;
  @ViewChild('mainTitle') mainTitle!: ElementRef;
  @ViewChild('conglomeradosContainer') conglomeradosContainer!: ElementRef;

  // State management
  currentSection: 'conglomerados' | 'papelera' = 'conglomerados';
  conglomerados: Conglomerado[] = [];
  papelera: Conglomerado[] = [];
  filteredConglomerados: Conglomerado[] = [];
  selectedConglomerado: Conglomerado | null = null;

  // Map properties
  map!: L.Map;
  circles: L.Circle[] = [];
  containerCircle: L.Circle | null = null;
  
  // Constants
  private readonly SUBPARCEL_RADIUS = 40;
  private readonly CONTAINER_RADIUS = 100;
  private readonly DEFAULT_CENTER: [number, number] = [4.6099, -74.0785];

  // Event listeners storage
  private eventListeners: (() => void)[] = [];

  constructor(
    private conglomeradoService: ConglomeradoService,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadConglomerados();
  }

  ngOnDestroy(): void {
    this.cleanupMap();
    this.cleanupEventListeners();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    this.setupUIEventListeners();
    this.cdRef.detectChanges();
  }

  private initializeMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    try {
      this.map = L.map(this.mapContainer.nativeElement, {
        preferCanvas: true,
        renderer: L.canvas()
      }).setView(this.DEFAULT_CENTER, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        updateWhenIdle: true,
        maxZoom: 19
      }).addTo(this.map);
    } catch (error) {
      console.error('Map initialization failed:', error);
    }
  }

  private setupUIEventListeners(): void {
    // Sidebar toggle
    if (this.menuToggle?.nativeElement) {
      this.addClickListener(this.menuToggle.nativeElement, this.toggleSidebar.bind(this));
    }

    // Overlay click
    if (this.overlay?.nativeElement) {
      this.addClickListener(this.overlay.nativeElement, this.closeSidebar.bind(this));
    }

    // Create button
    if (this.createButton?.nativeElement) {
      this.addClickListener(this.createButton.nativeElement, this.openCreateModal.bind(this));
    }

    // Status tabs
    document.querySelectorAll('.status-tab').forEach((tab: Element) => {
      if (tab instanceof HTMLElement) {
        this.addClickListener(tab, (e: Event) => this.handleStatusTabClick(e));
      }
    });

    // Form submission
    const form = document.getElementById('formCrearConglomerado');
    if (form) {
      this.addSubmitListener(form, this.handleFormSubmit.bind(this));
    }
  }

  private addClickListener(element: HTMLElement, handler: (event: Event) => void): void {
    const listener = this.renderer.listen(element, 'click', handler);
    this.eventListeners.push(listener);
  }

  private addSubmitListener(element: HTMLElement, handler: (event: Event) => void): void {
    const listener = this.renderer.listen(element, 'submit', handler);
    this.eventListeners.push(listener);
  }

  private cleanupEventListeners(): void {
    this.eventListeners.forEach(listener => listener());
    this.eventListeners = [];
  }

  // Map management
  private cleanupMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined!;
    }
    this.circles = [];
    this.containerCircle = null;
  }

  // UI Interactions
  private toggleSidebar(e: Event): void {
    e.stopPropagation();
    this.sidebar.nativeElement.classList.toggle('open');
    this.overlay.nativeElement.classList.toggle('open');
    this.menuToggle.nativeElement.classList.toggle('open');
  }

  private closeSidebar(): void {
    this.sidebar.nativeElement.classList.remove('open');
    this.overlay.nativeElement.classList.remove('open');
    this.menuToggle.nativeElement.classList.remove('open');
  }

  private openCreateModal(): void {
    const modal = document.getElementById('modalCrear');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      this.closeSidebar();
    }
  }

  private handleStatusTabClick(e: Event): void {
    const target = e.target as HTMLElement;
    const status = target.getAttribute('data-status');
    if (status) {
      document.querySelectorAll('.status-tab').forEach(tab => tab.classList.remove('active'));
      target.classList.add('active');
      this.filterConglomerados(status);
    }
  }

  private handleFormSubmit(e: Event): void {
    e.preventDefault();
    this.createNewConglomerado();
  }

  // Data Management
  loadConglomerados(): void {
    if (this.currentSection === 'conglomerados') {
      this.conglomerados = this.conglomeradoService.getConglomerados();
      this.filteredConglomerados = [...this.conglomerados]; // Copia para filtrado
    } else {
      this.papelera = this.conglomeradoService.getPapelera();
      this.filteredConglomerados = [...this.papelera]; // Copia para filtrado
    }
    this.renderConglomeradosList();
  }

  renderConglomeradosList(): void {
    if (!this.conglomeradosContainer?.nativeElement) return;
    
    const container = this.conglomeradosContainer.nativeElement;
    container.innerHTML = '';
    
    this.filteredConglomerados.forEach(conglomerado => {
      const div = this.renderer.createElement('div');
      div.className = 'conglomerado';
      
      // Create content with Renderer2
      this.renderer.setProperty(div, 'innerHTML', `
        <div class="conglomerado-id">${conglomerado.id}</div>
        <div class="conglomerado-info"><strong>Departamento:</strong> ${conglomerado.departamento}</div>
        <div class="conglomerado-info"><strong>Municipio:</strong> ${conglomerado.municipio}</div>
        <div class="conglomerado-info">
          <strong>Estado:</strong> 
          <span class="estado-badge ${conglomerado.estado}">${conglomerado.estado.toUpperCase()}</span>
        </div>
        <div class="options-menu">
          <button class="options-button" aria-label="Opciones">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </button>
          <div class="options-dropdown">
            <div class="option-item" data-action="details" data-id="${conglomerado.id}">Ver detalles</div>
            ${this.currentSection === 'conglomerados' ? 
              `<div class="option-item" data-action="edit" data-id="${conglomerado.id}">Editar</div>
               <div class="option-item" data-action="delete" data-id="${conglomerado.id}">Eliminar</div>` : 
              `<div class="option-item" data-action="restore" data-id="${conglomerado.id}">Restaurar</div>
               <div class="option-item delete-permanently" data-action="delete-permanently" data-id="${conglomerado.id}">Eliminar permanentemente</div>`}
          </div>
        </div>
      `);
      
      // Add event listener for item click
      this.renderer.listen(div, 'click', (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.options-menu')) {
          this.showDetails(conglomerado.id);
        }
      });
      
      container.appendChild(div);
    });
    
    this.setupOptionsMenuListeners();
  }

  private setupOptionsMenuListeners(): void {
    document.querySelectorAll('.options-button').forEach(button => {
      this.renderer.listen(button, 'click', (e: Event) => {
        e.stopPropagation();
        const dropdown = button.nextElementSibling as HTMLElement;
        if (dropdown) {
          dropdown.classList.toggle('show');
        }
      });
    });

    document.querySelectorAll('.option-item').forEach(item => {
      this.renderer.listen(item, 'click', (e: Event) => {
        e.stopPropagation();
        const action = item.getAttribute('data-action');
        const id = item.getAttribute('data-id');
        if (action && id) {
          this.handleOptionAction(action, id);
        }
      });
    });
  }

  private handleOptionAction(action: string, id: string): void {
    switch (action) {
      case 'details':
        this.showDetails(id);
        break;
      case 'edit':
        this.editConglomerado(id);
        break;
      case 'delete':
        this.deleteConglomerado(id);
        break;
      case 'restore':
        this.restoreConglomerado(id);
        break;
      case 'delete-permanently':
        this.deletePermanently(id);
        break;
    }
  }

  // Modal Management
  showDetails(conglomeradoId: string): void {
    const data = this.currentSection === 'conglomerados' 
      ? this.conglomerados.find(c => c.id === conglomeradoId) || null
      : this.papelera.find(c => c.id === conglomeradoId) || null;
    
    if (!data) return;
    
    this.selectedConglomerado = data;
    
    // Update modal content
    this.setTextContent('modalConglomeradoId', data.id);
    this.setTextContent('fechaInicioDetalle', this.formatDate(data.fecha_inicio));
    this.setTextContent('fechaFinDetalle', this.formatDate(data.fecha_finalizacion));
    this.setTextContent('departamentoDetalle', data.departamento);
    this.setTextContent('municipioDetalle', data.municipio);
    this.setTextContent('corregimientoDetalle', data.corregimiento || 'N/A');
    this.setTextContent('coordenadasDetalle', data.coordenadas_centro);
    this.setTextContent('aprobadoPorDetalle', data.aprobado_por || 'N/A');
    this.setTextContent('precisionDetalle', data.precision);
    this.setTextContent('fechaAprobacionDetalle', data.fecha_aprobacion || 'N/A');
    this.setTextContent('estadoDetalle', data.estado.toUpperCase());
    
    // Update point reference
    this.setTextContent('puntoTipoDetalle', data.punto_referencia?.tipo || 'N/A');
    this.setTextContent('puntoAzimutDetalle', data.punto_referencia?.azimut || 'N/A');
    this.setTextContent('puntoDistanciaDetalle', data.punto_referencia?.distancia_horizontal || 'N/A');
    
    // Update subparcels table
    this.updateSubparcelsTable(data.subparcelas);
    
    // Initialize map
    const coordenadas = this.parseDMS(data.coordenadas_centro);
    if (coordenadas) {
      this.initMapInModal(coordenadas);
      setTimeout(() => this.generateSubparcelsOnMap(coordenadas, data.subparcelas), 200);
    } else {
      this.showMapError(data.coordenadas_centro);
    }
    
    // Setup action buttons
    this.setupActionButtons(data);
    
    // Show modal
    this.showModal();
  }

  private formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Fecha inválida';
    }
  }

  private updateSubparcelsTable(subparcelas: Subparcela[]): void {
    const tableBody = document.getElementById('subparcelasTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    subparcelas.forEach(subparcela => {
      const row = this.renderer.createElement('tr');
      row.innerHTML = `
        <td>${subparcela.id}</td>
        <td>${subparcela.radio}</td>
        <td>${subparcela.azimut}</td>
        <td>${subparcela.distancia_centro}</td>
        <td>${subparcela.materializado}</td>
        <td>${subparcela.color}</td>
        <td>${subparcela.posicion}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  private showMapError(coordenadas: string): void {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="map-error">
          <p>No se pudo mostrar el mapa</p>
          <small>Coordenadas inválidas: ${coordenadas || 'No proporcionadas'}</small>
        </div>
      `;
    }
  }

  private setupActionButtons(data: Conglomerado): void {
    const actionButtons = document.getElementById('actionButtons');
    if (!actionButtons) return;
    
    actionButtons.innerHTML = '';
    
    if (this.currentSection === 'conglomerados') {
      if (data.estado === 'pendientes') {
        this.addButton(actionButtons, 'RECHAZAR', 'reject-button', () => this.changeStatus(data.id, 'rechazados'));
        this.addButton(actionButtons, 'CORREGIR', 'correct-button', () => this.changeStatus(data.id, 'corregir'));
        this.addButton(actionButtons, 'APROBAR', 'approve-button', () => this.changeStatus(data.id, 'aprobados'));
      } else if (data.estado === 'rechazados') {
        this.addButton(actionButtons, 'REVISAR', 'correct-button', () => this.changeStatus(data.id, 'pendientes'));
        this.addButton(actionButtons, 'APROBAR', 'approve-button', () => this.changeStatus(data.id, 'aprobados'));
      } else if (data.estado === 'aprobados') {
        this.addButton(actionButtons, 'RECHAZAR', 'reject-button', () => this.changeStatus(data.id, 'rechazados'));
      }
    } else {
      this.addButton(actionButtons, 'RESTAURAR', 'approve-button', () => this.restoreConglomerado(data.id));
      this.addButton(actionButtons, 'ELIMINAR PERMANENTEMENTE', 'reject-button', () => this.deletePermanently(data.id));
    }
  }

  private addButton(container: HTMLElement, text: string, className: string, handler: () => void): void {
    const button = this.renderer.createElement('button');
    button.textContent = text;
    button.className = `action-button ${className}`;
    this.renderer.listen(button, 'click', handler);
    container.appendChild(button);
  }

  private showModal(): void {
    const modal = document.getElementById('modalDetalles');
    const body = document.body;
    
    if (modal) {
      modal.style.display = 'flex';
      body.style.overflow = 'hidden';
      
      const closeButton = document.getElementById('closeModal');
      if (closeButton) {
        this.renderer.listen(closeButton, 'click', () => {
          modal.style.display = 'none';
          body.style.overflow = 'auto';
        });
      }
    }
  }

  // Map Generation
  initMapInModal(center: [number, number]): L.Map {
    this.clearMap(); // Limpia el mapa anterior si existe
    const mapElement = document.getElementById('map');
    if (!mapElement) throw new Error('Elemento del mapa no encontrado');
  
    this.map = L.map(mapElement, {
      preferCanvas: true,
      center,
      zoom: 15,
      zoomControl: true,
      renderer: L.canvas()
    });
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      updateWhenIdle: true,
      maxZoom: 19
    }).addTo(this.map);
  
    setTimeout(() => this.map.invalidateSize(true), 100);
    return this.map;
  }

  generateSubparcelsOnMap(center: [number, number], subparcelas: Subparcela[]): void {
    this.clearMap();
    
    // Container circle
    this.containerCircle = L.circle(center, {
      color: '#FFD700',
      fillColor: '#FFD700',
      fillOpacity: 0.2,
      radius: 120,
      weight: 2
    }).addTo(this.map).bindTooltip("Área del Conglomerado", { permanent: false });
    
    // Subparcel positions
    const subparcelPositions = [
      { id: "SPF1", position: "Centro", color: "#FF0000", distance: 0, azimuth: 0 },
      { id: "SPN", position: "Norte", color: "#0000FF", distance: 80, azimuth: 0 },
      { id: "SPE", position: "Este", color: "#00FF00", distance: 80, azimuth: 90 },
      { id: "SPS", position: "Sur", color: "#FFFF00", distance: 80, azimuth: 180 },
      { id: "SPO", position: "Oeste", color: "#FFFFFF", distance: 80, azimuth: 270 }
    ];
    
    subparcelPositions.forEach(sp => {
      const position = sp.distance > 0 
        ? this.calculateOffset(center, sp.distance, sp.azimuth) 
        : center;
      
      const circle = L.circle(position, {
        color: sp.color,
        fillColor: sp.color,
        fillOpacity: 0.6,
        radius: 40,
        weight: 1
      }).addTo(this.map)
      .bindTooltip(`${sp.id} (${sp.position})`, { permanent: false });
      
      this.circles.push(circle);
    });
    
    // Fit bounds
    const allCircles = L.featureGroup([this.containerCircle, ...this.circles]);
    this.map.fitBounds(allCircles.getBounds(), {
      padding: [30, 30],
      maxZoom: 17
    });
    
    setTimeout(() => this.map.invalidateSize(true), 100);
  }

  clearMap(): void {
    this.circles.forEach(circle => this.map.removeLayer(circle));
    this.circles = [];
    
    if (this.containerCircle) {
      this.map.removeLayer(this.containerCircle);
      this.containerCircle = null;
    }
  }

  // Utility Methods
  parseDMS(coordenadas: string): [number, number] | null {
    if (!coordenadas) return null;
    let cleanedCoords = coordenadas.trim().replace(/\s+/g, ' ');
    
    const patterns = [
      /^(\d+)°(\d+)'([\d.]+)"([NS])\s+(\d+)°(\d+)'([\d.]+)"([EW])$/i,
      /^(\d+)°(\d+)'(\d+)"([NS])\s+(\d+)°(\d+)'(\d+)"([EW])$/i,
      /^([\d.]+)([NS])\s+([\d.]+)([EW])$/i,
      /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/
    ];
    
    let matches: RegExpMatchArray | null = null;
    for (const pattern of patterns) {
      matches = cleanedCoords.match(pattern);
      if (matches) break;
    }
    
    if (!matches) return null;
    
    let lat: number, lng: number;
    
    if (matches.length === 9) {
      lat = parseFloat(matches[1]) + (parseFloat(matches[2]) / 60) + (parseFloat(matches[3]) / 3600);
      if (matches[4].toUpperCase() === 'S') lat = -lat;
      lng = parseFloat(matches[5]) + (parseFloat(matches[6]) / 60) + (parseFloat(matches[7]) / 3600);
      if (matches[8].toUpperCase() === 'W') lng = -lng;
    } else if (matches.length === 5) {
      lat = parseFloat(matches[1]);
      if (matches[2].toUpperCase() === 'S') lat = -lat;
      lng = parseFloat(matches[3]);
      if (matches[4].toUpperCase() === 'W') lng = -lng;
    } else if (matches.length === 3) {
      lat = parseFloat(matches[1]);
      lng = parseFloat(matches[2]);
    } else {
      return null;
    }
    
    if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return null;
    }
    
    return [lat, lng];
  }

  calculateOffset(center: [number, number], distance: number, bearing: number): [number, number] {
    const earthRadius = 6378137;
    const latRad = center[0] * Math.PI / 180;
    const angularDist = distance / earthRadius;
    const bearingRad = bearing * Math.PI / 180;
    
    const newLat = Math.asin(
      Math.sin(latRad) * Math.cos(angularDist) + 
      Math.cos(latRad) * Math.sin(angularDist) * Math.cos(bearingRad)
    );
    
    const newLng = center[1] * Math.PI / 180 + Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDist) * Math.cos(latRad),
      Math.cos(angularDist) - Math.sin(latRad) * Math.sin(newLat)
    );
    
    return [
      newLat * 180 / Math.PI,
      ((newLng * 180 / Math.PI) + 540) % 360 - 180
    ];
  }

  private setTextContent(elementId: string, text: string): void {
    const element = document.getElementById(elementId);
    if (element) element.textContent = text;
  }

  // CRUD Operations
  createNewConglomerado(): void {
    const form = document.getElementById('formCrearConglomerado') as HTMLFormElement;
    if (!form) return;
    
    const formData = new FormData(form);
    const newConglomerado: Conglomerado = {
      id: `CONG-${Date.now()}`,
      coordenadas_centro: formData.get('coordenadas') as string,
      departamento: formData.get('departamento') as string,
      municipio: formData.get('municipio') as string,
      corregimiento: formData.get('corregimiento') as string || undefined,
      fecha_inicio: formData.get('fechaInicio') as string,
      fecha_finalizacion: formData.get('fechaFin') as string,
      aprobado_por: '',
      precision: formData.get('precision') as string,
      fecha_aprobacion: '',
      estado: 'pendientes',
      punto_referencia: {
        tipo: formData.get('puntoTipo') as string,
        azimut: formData.get('puntoAzimut') as string,
        distancia_horizontal: formData.get('puntoDistancia') as string
      },
      subparcelas: [
        { id: 'SPF1', radio: '40 m', azimut: '0°', distancia_centro: '0 m', materializado: 'No', color: 'Rojo', posicion: 'Centro' },
        { id: 'SPN', radio: '40 m', azimut: '0°', distancia_centro: '80 m', materializado: 'No', color: 'Azul', posicion: 'Norte' },
        { id: 'SPE', radio: '40 m', azimut: '90°', distancia_centro: '80 m', materializado: 'No', color: 'Verde', posicion: 'Este' },
        { id: 'SPS', radio: '40 m', azimut: '180°', distancia_centro: '80 m', materializado: 'No', color: 'Amarillo', posicion: 'Sur' },
        { id: 'SPO', radio: '40 m', azimut: '270°', distancia_centro: '80 m', materializado: 'No', color: 'Blanco', posicion: 'Oeste' }
      ]
    };
  
    // Guarda en el servicio
    this.conglomeradoService.createConglomerado(newConglomerado);
  
    // Recarga los datos
    this.loadConglomerados();
  
    // Cierra el modal
    const modalCrear = document.getElementById('modalCrear');
    if (modalCrear) modalCrear.style.display = 'none';
  
    // Reinicia el formulario
    form.reset();
  }

  changeStatus(id: string, newStatus: 'pendientes' | 'rechazados' | 'corregir' | 'aprobados' | 'eliminado'): void {
    const index = this.conglomerados.findIndex(c => c.id === id);
    if (index !== -1) {
      if (newStatus === 'corregir') {
        alert(`El conglomerado ${id} ha sido marcado para corrección`);
        return;
      }
      
      this.conglomerados[index].estado = newStatus;
      
      if (newStatus === 'aprobados') {
        this.conglomerados[index].aprobado_por = "Usuario Actual";
        this.conglomerados[index].fecha_aprobacion = new Date().toLocaleDateString();
      }
      
      this.conglomeradoService.updateConglomerado(this.conglomerados[index]);
      this.loadConglomerados();
      
      const modal = document.getElementById('modalDetalles');
      if (modal) modal.style.display = 'none';
      
      document.body.style.overflow = 'auto';
    }
  }

  editConglomerado(id: string): void {
    alert(`Editando conglomerado ${id} - Implementar lógica de edición`);
  }

  deleteConglomerado(id: string): void {
    if (confirm(`¿Estás seguro de que deseas mover el conglomerado ${id} a la papelera?`)) {
      const index = this.conglomerados.findIndex(c => c.id === id);
      if (index !== -1) {
        const [deleted] = this.conglomerados.splice(index, 1);
        this.papelera.push(deleted);
        this.conglomeradoService.updateConglomerados(this.conglomerados);
        this.conglomeradoService.updatePapelera(this.papelera);
        this.loadConglomerados(); // Actualiza la vista
      }
    }
  }
  
  restoreConglomerado(id: string): void {
    const index = this.papelera.findIndex(c => c.id === id);
    if (index !== -1) {
      const [restored] = this.papelera.splice(index, 1);
      this.conglomerados.push(restored);
      this.conglomeradoService.updateConglomerados(this.conglomerados);
      this.conglomeradoService.updatePapelera(this.papelera);
      this.loadConglomerados(); // Actualiza la vista
    }
  }
  
  deletePermanently(id: string): void {
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el conglomerado ${id}? Esta acción no se puede deshacer.`)) {
      this.papelera = this.papelera.filter(c => c.id !== id);
      this.conglomeradoService.updatePapelera(this.papelera);
      this.loadConglomerados(); // Actualiza la vista
    }
  }

  filterConglomerados(status: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      
      document.querySelectorAll('.status-tab').forEach(tab => tab.classList.remove('active'));
      (event.target as Element).classList.add('active');
    }
    
    if (this.currentSection === 'conglomerados') {
      this.filteredConglomerados = status === 'all' 
        ? this.conglomerados.filter(c => c.estado !== 'eliminado')
        : this.conglomerados.filter(c => c.estado === status);
    }
    
    this.renderConglomeradosList();
  }

  toggleSection(section: 'conglomerados' | 'papelera'): void {
    this.currentSection = section;
    this.loadConglomerados(); // Siempre recarga desde el servicio
  }

  // Document click handler for dropdowns
  onDocumentClick(e: Event): void {
    const target = e.target as HTMLElement;
    
    if (!target.closest('.options-menu')) {
      document.querySelectorAll('.options-dropdown').forEach(dropdown => {
        dropdown.classList.remove('show');
      });
    }
  }
}