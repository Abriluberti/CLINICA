import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoTurnosPorMedicoComponent } from './grafico-turnos-por-medico.component';

describe('GraficoTurnosPorMedicoComponent', () => {
  let component: GraficoTurnosPorMedicoComponent;
  let fixture: ComponentFixture<GraficoTurnosPorMedicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoTurnosPorMedicoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoTurnosPorMedicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
