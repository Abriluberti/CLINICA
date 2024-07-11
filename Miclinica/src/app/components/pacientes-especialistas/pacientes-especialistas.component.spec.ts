import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientesEspecialistasComponent } from './pacientes-especialistas.component';

describe('PacientesEspecialistasComponent', () => {
  let component: PacientesEspecialistasComponent;
  let fixture: ComponentFixture<PacientesEspecialistasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacientesEspecialistasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacientesEspecialistasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
