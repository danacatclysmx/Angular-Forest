import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstilosBaseComponent } from './estilos-base.component';

describe('EstilosBaseComponent', () => {
  let component: EstilosBaseComponent;
  let fixture: ComponentFixture<EstilosBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstilosBaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstilosBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
