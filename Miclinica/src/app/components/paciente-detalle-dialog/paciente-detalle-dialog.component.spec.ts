import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteDetalleDialogComponent } from './paciente-detalle-dialog.component';

describe('PacienteDetalleDialogComponent', () => {
  let component: PacienteDetalleDialogComponent;
  let fixture: ComponentFixture<PacienteDetalleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteDetalleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacienteDetalleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
