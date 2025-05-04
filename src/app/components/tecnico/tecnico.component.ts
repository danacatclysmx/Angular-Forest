import { Component } from '@angular/core';

// Interfaces para tipado
interface Conglomerado {
  id: string;
  nombre?: string;
  departamento?: string;
  municipio?: string;
  estado: string;
  testator?: string; // Propiedad faltante
  [key: string]: any; // Para propiedades adicionales
}

interface Muestra {
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

interface Ruta {
  id: string;
  codigo: string;
  conglomerado: string;
  fecha: string;
  estado: number;
  tiempoEstimado?: string; // Propiedad faltante
  fechaRecoleccion?: string;
  fechaEnvio?: string;
  fechaEnRuta?: string;
  fechaEntrega?: string;
}

interface PapeleraItem {
  id: string;
  tipo: 'conglomerado' | 'muestra' | 'ruta';
  // Propiedades comunes requeridas
  estado?: string; // Para Conglomerado
  codigo?: string; // Para Ruta
  conglomerado?: string; // Para Ruta
  fecha?: string; // Para Ruta
  // Propiedades adicionales
  [key: string]: any;
}

@Component({
  
  selector: 'app-tecnico',
  templateUrl: './tecnico.component.html',
  styleUrls: ['./tecnico.component.css']
})
export class TecnicoComponent {
  // Elementos del DOM
  muestrasSection!: HTMLElement;
  menuToggle!: HTMLElement;
  sidebar!: HTMLElement;
  overlay!: HTMLElement;
  createButton!: HTMLElement;
  statusTabs!: HTMLElement;
  mainTitle!: HTMLElement;
  conglomeradosContainer!: HTMLElement;
  rutasSection!: HTMLElement;
  rutasContainer!: HTMLElement;
  codigoMuestraInput!: HTMLInputElement;
  subparcelaInput!: HTMLInputElement;

  // Datos
  conglomerados: Conglomerado[] = [];
  muestras: Muestra[] = [];
  rutas: Ruta[] = [];
  papelera: PapeleraItem[] = [];
  currentSection: 'conglomerados' | 'muestras' | 'rutas' | 'papelera' = 'conglomerados';

  constructor() {
    this.initializeDOMElements();
    this.loadInitialData();
    this.initApp();
  }

  private initializeDOMElements(): void {
    this.muestrasSection = document.getElementById("muestrasSection")!;
    this.menuToggle = document.getElementById("menuToggle")!;
    this.sidebar = document.getElementById("sidebar")!;
    this.overlay = document.getElementById("overlay")!;
    this.createButton = document.getElementById("createButton")!;
    this.statusTabs = document.getElementById("statusTabs")!;
    this.mainTitle = document.getElementById("mainTitle")!;
    this.conglomeradosContainer = document.getElementById("conglomeradosContainer")!;
    this.rutasSection = document.getElementById("rutasSection")!;
    this.rutasContainer = document.getElementById("rutasContainer")!;
    this.codigoMuestraInput = document.getElementById("codigoMuestra") as HTMLInputElement;
    this.subparcelaInput = document.getElementById("subparcela") as HTMLInputElement;
  }

  private loadInitialData(): void {
    this.conglomerados = JSON.parse(localStorage.getItem("conglomerados") || "[]");
    this.muestras = JSON.parse(localStorage.getItem("muestras") || "[]");
    this.rutas = JSON.parse(localStorage.getItem("rutas") || "[]");
    this.papelera = JSON.parse(localStorage.getItem("papelera") || "[]");

    if (this.rutas.length === 0) {
      this.rutas = [
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
      this.saveToLocalStorage();
    }
  }

  private initApp(): void {
    this.rutas = this.rutas.map((r: Ruta) => ({ ...r, estado: r.estado || 0 }));
    this.saveToLocalStorage();
    this.loadData();
    this.setupEventListeners();
  }

  private saveToLocalStorage(): void {
    localStorage.setItem("conglomerados", JSON.stringify(this.conglomerados));
    localStorage.setItem("muestras", JSON.stringify(this.muestras));
    localStorage.setItem("rutas", JSON.stringify(this.rutas));
    localStorage.setItem("papelera", JSON.stringify(this.papelera));
  }

  loadData(): void {
    this.conglomeradosContainer.style.display = "none";
    this.rutasSection.style.display = "none";
    this.conglomeradosContainer.innerHTML = "";
    this.rutasContainer.innerHTML = "";

    switch (this.currentSection) {
      case "conglomerados":
        this.loadConglomerados();
        break;
      case "muestras":
        this.loadMuestras();
        break;
      case "rutas":
        this.loadRutas();
        break;
      case "papelera":
        this.loadPapelera();
        break;
    }
  }

  private loadConglomerados(): void {
    this.mainTitle.textContent = "CONGLOMERADOS";
    this.statusTabs.style.display = "flex";
    this.conglomeradosContainer.style.display = "block";
    
    const filteredConglomerados = this.conglomerados.filter(c => c.estado !== "eliminado");
    
    if (filteredConglomerados.length === 0) {
      this.conglomeradosContainer.innerHTML = '<p class="no-data">No hay conglomerados registrados</p>';
    } else {
      filteredConglomerados.forEach(conglomerado => {
        this.conglomeradosContainer.appendChild(this.createConglomeradoCard(conglomerado));
      });
    }
  }

  private loadMuestras(): void {
    this.mainTitle.textContent = "MUESTRAS";
    this.statusTabs.style.display = "none";
    this.conglomeradosContainer.style.display = "none";
    this.rutasSection.style.display = "none";
    this.muestrasSection.style.display = "block";
    this.inicializarFormularioMuestras();
    this.cargarListadoMuestras();
  }

  private loadRutas(): void {
    this.mainTitle.textContent = "RUTAS DE MUESTREO";
    this.statusTabs.style.display = "none";
    this.conglomeradosContainer.style.display = "none";
    this.rutasSection.style.display = "block";
    
    if (this.rutas.length === 0) {
      this.rutasContainer.innerHTML = '<p class="no-data">No hay rutas registradas</p>';
    } else {
      this.rutas.forEach(ruta => {
        this.rutasContainer.appendChild(this.createRutaCard(ruta));
      });
    }
  }

  private loadPapelera(): void {
    this.mainTitle.textContent = "PAPELERA";
    this.statusTabs.style.display = "none";
    this.conglomeradosContainer.style.display = "block";
    
    if (this.papelera.length === 0) {
      this.conglomeradosContainer.innerHTML = '<p class="no-data">La papelera está vacía</p>';
    } else {
      this.papelera.forEach(item => {
        if (item.tipo === "conglomerado") {
          this.conglomeradosContainer.appendChild(
            this.createConglomeradoCard(item as Conglomerado, true)
          );
        } else if (item.tipo === "muestra") {
          this.conglomeradosContainer.appendChild(this.createMuestraCard(item as Muestra, true));
        } else if (item.tipo === "ruta") {
          const ruta: Ruta = {
            id: item.id,
            codigo: item.codigo || '',
            conglomerado: item.conglomerado || '',
            fecha: item.fecha || '',
            estado: typeof item.estado === 'number' ? item.estado : Number(item.estado) || 0
          };
          this.conglomeradosContainer.appendChild(
            this.createRutaCard(ruta, true)
          );
        }
      });
    }
  }

  private createConglomeradoCard(item: PapeleraItem | Conglomerado, isTrash: boolean = false): HTMLElement {
     // Verificar si es un Conglomerado válido
  const conglomerado = item as Conglomerado;
  if (!conglomerado.id) {
    console.error('Item no es un Conglomerado válido:', item);
    return document.createElement('div');
  }
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>${conglomerado.nombre || "Sin nombre"}</h3>
      <p>Departamento: ${conglomerado.departamento || "No especificado"}</p>
      <p>Municipio: ${conglomerado.municipio || "No especificado"}</p>
      <p>Estado: ${conglomerado.estado || "pendiente"}</p>
      ${
        isTrash
          ? `<button onclick="this.restoreItem('${conglomerado.id}')">Restaurar</button>`
          : `<button onclick="this.viewDetails('${conglomerado.id}', 'conglomerado')">Ver Detalles</button>`
      }
    `;
    return card;
  }

  createMuestraCard(muestra: Muestra, isTrash: boolean = false): HTMLElement {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>${muestra.codigo || "Sin código"}</h3>
      <p>Conglomerado: ${muestra.conglomerado || "No especificado"}</p>
      <p>Tipo de muestra: ${muestra.tipo || "No especificado"}</p>
      ${
        isTrash
          ? `<button onclick="this.restoreItem('${muestra.id}')">Restaurar</button>`
          : `<button onclick="this.viewDetails('${muestra.id}', 'muestra')">Ver Detalles</button>`
      }
    `;
    return card;
  }

  private createRutaCard(ruta: Ruta, isTrash: boolean = false): HTMLElement {
    const estado = typeof ruta.estado === 'string' ? parseInt(ruta.estado) : ruta.estado;
    ruta.tiempoEstimado = ruta.tiempoEstimado || "No especificado";
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <div class="info">
        <h2>Muestra <span class="order-code">${ruta.codigo || "XXX000"}</span></h2>
        <p>Tiempo estimado: ${ruta.tiempoEstimado || "No especificado"}</p>
        <p>Del conglomerado: ${ruta.conglomerado || "No especificado"}</p>
      </div>
      <div class="progress-container">
        <div class="progress">
          <div class="step ${ruta.estado >= 1 ? "active" : ""}"><i class="fas fa-edit"></i></div>
          <div class="step ${ruta.estado >= 2 ? "active" : ""}"><i class="fas fa-truck-loading"></i></div>
          <div class="step ${ruta.estado >= 3 ? "active" : ""}"><i class="fas fa-truck-moving"></i></div>
          <div class="step ${ruta.estado >= 4 ? "active" : ""}"><i class="fa-solid fa-flask"></i></div>
        </div>
        <div class="labels">
          <p>Recolectando</p>
          <p>Enviado</p>
          <p>En Ruta</p>
          <p>Entregado</p>
        </div>
      </div>
      <div class="buttons">
        <button class="prev-btn">◀ Anterior</button>
        <button class="next-btn">Siguiente ▶</button>
      </div>
      ${
        isTrash
          ? `<button onclick="this.restoreItem('${ruta.id}')">Restaurar</button>`
          : `<button onclick="this.deleteItem('${ruta.id}', 'ruta')">Eliminar</button>`
      }
    `;
    
    const currentEstado = ruta.estado || 0;
    const steps = card.querySelectorAll(".step");
    const prevBtn = card.querySelector(".prev-btn") as HTMLButtonElement;
    const nextBtn = card.querySelector(".next-btn") as HTMLButtonElement;

    const updateSteps = () => {
      steps.forEach((step, index) => {
        step.classList.toggle("active", index <= currentEstado);
      });
      if (prevBtn) prevBtn.disabled = currentEstado === 0;
      if (nextBtn) nextBtn.disabled = currentEstado === steps.length - 1;
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentEstado > 0) {
          ruta.estado = currentEstado - 1;
          this.saveToLocalStorage();
          updateSteps();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentEstado < steps.length - 1) {
          ruta.estado = currentEstado + 1;
          this.saveToLocalStorage();
          updateSteps();
        }
      });
    }

    updateSteps();
    return card;
  }

  private setupEventListeners(): void {
    // Menú lateral
    this.menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      this.sidebar.classList.toggle("open");
      this.overlay.classList.toggle("open");
      this.menuToggle.classList.toggle("open");
    });

    this.overlay.addEventListener("click", () => {
      this.sidebar.classList.remove("open");
      this.overlay.classList.remove("open");
      this.menuToggle.classList.remove("open");
    });

    // Navegación del menú
    document.querySelectorAll(".menu-item").forEach((item) => {
      item.addEventListener("click", () => {
        document.querySelectorAll(".menu-item").forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
        this.currentSection = item.getAttribute("data-section") as 'conglomerados' | 'muestras' | 'rutas' | 'papelera';
        this.loadData();
        
        this.sidebar.classList.remove("open");
        this.overlay.classList.remove("open");
        this.menuToggle.classList.remove("open");
      });
    });

    // Botón CREAR
    this.createButton.addEventListener("click", () => {
      if (this.currentSection === "muestras") {
        document.getElementById("formularioRegistroMuestra")?.scrollIntoView();
      } else {
        alert(`Implementar modal para crear ${this.currentSection}`);
      }
      this.sidebar.classList.remove("open");
      this.overlay.classList.remove("open");
      this.menuToggle.classList.remove("open");
    });
  }

  filterConglomerados(status: string, event?: Event): void {
    if (event) {
      document.querySelectorAll(".status-tab").forEach((tab) => tab.classList.remove("active"));
      (event.target as HTMLElement).classList.add("active");
    }
  
    const filtered = this.conglomerados.filter((c: Conglomerado) => c.estado === status);
    this.conglomeradosContainer.innerHTML = "";
    
    if (filtered.length === 0) {
      this.conglomeradosContainer.innerHTML = '<p class="no-data">No hay conglomerados con este estado</p>';
    } else {
      filtered.forEach((conglomerado: Conglomerado) => {
        this.conglomeradosContainer.appendChild(this.createConglomeradoCard(conglomerado));
      });
    }
  }

  restoreItem(id: string): void {
    const item = this.papelera.find((i) => i.id === id);
    if (!item) return;

    switch (item.tipo) {
        case "conglomerado":
            this.conglomerados.push(item as Conglomerado);
            break;
        case "muestra":
            this.muestras.push(item as Muestra);
            break;
        case "ruta":
            // Conversión segura sin cambiar la estructura
            const rutaConvertida: Ruta = {
                id: item.id,
                codigo: (item as any).codigo || 'SIN_CODIGO',
                conglomerado: (item as any).conglomerado || 'SIN_CONGLOMERADO',
                fecha: (item as any).fecha || new Date().toISOString(),
                estado: Number((item as any).estado) || 0 // Conversión explícita a número
            };
            this.rutas.push(rutaConvertida);
            break;
    }

    this.papelera = this.papelera.filter((i) => i.id !== id);
    this.saveToLocalStorage();
    this.loadData();
}

  deleteItem(id: string, type: string): void {
    if (!confirm(`¿Estás seguro de eliminar este ${type}?`)) return;
    
    let item: any;
    if (type === "conglomerado") {
      item = this.conglomerados.find((c: Conglomerado) => c.id === id);
      this.conglomerados = this.conglomerados.filter((c: Conglomerado) => c.id !== id);
    } else if (type === "muestra") {
      item = this.muestras.find((m: Muestra) => m.id === id);
      this.muestras = this.muestras.filter((m: Muestra) => m.id !== id);
    } else if (type === "ruta") {
      item = this.rutas.find((r: Ruta) => r.id === id);
      this.rutas = this.rutas.filter((r: Ruta) => r.id !== id);
    }
    
    if (item) {
      item.tipo = type;
      this.papelera.push(item);
      this.saveToLocalStorage();
      this.loadData();
    }
  }

  viewDetails(id: string, type: string): void {
    alert(`Mostrar detalles del ${type} con ID: ${id}`);
  }

  private inicializarFormularioMuestras(): void {
    const formulario = document.getElementById("formularioRegistroMuestra") as HTMLFormElement;
    
    if (formulario) {
      formulario.addEventListener("submit", (e: SubmitEvent) => {
        e.preventDefault();
        this.guardarMuestra();
      });
      
      this.codigoMuestraInput.value = "MUES_" + Math.random().toString(36).substr(2, 8).toUpperCase();
      
      const urlParams = new URLSearchParams(window.location.search);
      const conglomeradoId = urlParams.get("conglomerado");
      
      if (conglomeradoId) {
        this.subparcelaInput.value = conglomeradoId;
      }
    }
  }

  private guardarMuestra(): void {
    const nuevaMuestra: Muestra = {
      id: Date.now().toString(),
      codigo: this.codigoMuestraInput.value,
      conglomerado: this.subparcelaInput.value,
      fechaRecoleccion: (document.getElementById("fechaRecoleccion") as HTMLInputElement).value,
      azimut: (document.getElementById("azimut") as HTMLInputElement).value,
      distancia: (document.getElementById("distancia") as HTMLInputElement).value,
      profundidad: (document.getElementById("profundidad") as HTMLInputElement).value,
      colorSuelo: (document.getElementById("colorSuelo") as HTMLInputElement).value,
      pesoFresco: (document.getElementById("pesoFresco") as HTMLInputElement).value,
      analisis: Array.from(document.querySelectorAll('input[name="analisis"]:checked'))
        .map((el: Element) => (el as HTMLInputElement).value),
      observaciones: (document.getElementById("observaciones") as HTMLTextAreaElement).value,
      fechaRegistro: new Date().toISOString(),
    };
    
    this.muestras.push(nuevaMuestra);
    this.saveToLocalStorage();
    
    alert("Muestra registrada correctamente");
    (document.getElementById("formularioRegistroMuestra") as HTMLFormElement).reset();
    this.cargarListadoMuestras();
  }

  private cargarListadoMuestras(): void {
    const contenedor = document.getElementById("listadoMuestras") as HTMLElement;
    contenedor.innerHTML = "";
    
    if (this.muestras.length === 0) {
      contenedor.innerHTML = '<p class="no-data">No hay muestras registradas</p>';
      return;
    }
    
    this.muestras.forEach((muestra: Muestra) => {
      const card = document.createElement("div");
      card.className = "muestra-card";
      card.innerHTML = `
        <h3>${muestra.codigo}</h3>
        <p><strong>Conglomerado:</strong> ${muestra.conglomerado}</p>
        <p><strong>Fecha:</strong> ${new Date(muestra.fechaRecoleccion).toLocaleDateString()}</p>
        <p><strong>Análisis:</strong> ${muestra.analisis.join(", ")}</p>
        <button onclick="this.eliminarMuestra('${muestra.id}')">Eliminar</button>
      `;
      contenedor.appendChild(card);
    });
  }

  eliminarMuestra(id: string): void {
    if (confirm("¿Estás seguro de eliminar esta muestra?")) {
      this.muestras = this.muestras.filter((m: Muestra) => m.id !== id);
      this.saveToLocalStorage();
      this.cargarListadoMuestras();
    }
  }
}