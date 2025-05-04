import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JefeComponent } from './jefe.component';
import { ConglomeradoService } from '../../services/conglomerado.service';
import { of } from 'rxjs';

describe('JefeComponent', () => {
  let component: JefeComponent;
  let fixture: ComponentFixture<JefeComponent>;
  let service: ConglomeradoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JefeComponent ],
      providers: [ ConglomeradoService ]
    })
    .compileComponents();
    
    service = TestBed.inject(ConglomeradoService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JefeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load conglomerados on init', () => {
    spyOn(service, 'getConglomerados').and.returnValue([]);
    spyOn(service, 'getPapelera').and.returnValue([]);
    
    component.ngOnInit();
    
    expect(service.getConglomerados).toHaveBeenCalled();
    expect(service.getPapelera).toHaveBeenCalled();
  });

  it('should filter conglomerados correctly', () => {
    component.conglomerados = [
      { id: '1', estado: 'pendientes' } as any,
      { id: '2', estado: 'aprobados' } as any
    ];
    
    component.filterConglomerados('pendientes');
    expect(component.filteredConglomerados.length).toBe(1);
    expect(component.filteredConglomerados[0].id).toBe('1');
  });
});