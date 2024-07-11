import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoTurnosPorDiaComponentComponent } from './grafico-turnos-por-dia-component.component';

describe('GraficoTurnosPorDiaComponentComponent', () => {
  let component: GraficoTurnosPorDiaComponentComponent;
  let fixture: ComponentFixture<GraficoTurnosPorDiaComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoTurnosPorDiaComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoTurnosPorDiaComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
