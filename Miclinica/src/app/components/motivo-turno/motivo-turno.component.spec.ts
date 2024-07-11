import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivoTurnoComponent } from './motivo-turno.component';

describe('MotivoTurnoComponent', () => {
  let component: MotivoTurnoComponent;
  let fixture: ComponentFixture<MotivoTurnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotivoTurnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotivoTurnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
