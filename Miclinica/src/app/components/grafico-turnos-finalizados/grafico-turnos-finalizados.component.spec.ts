import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoTurnosFinalizadosComponent } from './grafico-turnos-finalizados.component';

describe('GraficoTurnosFinalizadosComponent', () => {
  let component: GraficoTurnosFinalizadosComponent;
  let fixture: ComponentFixture<GraficoTurnosFinalizadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoTurnosFinalizadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoTurnosFinalizadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
