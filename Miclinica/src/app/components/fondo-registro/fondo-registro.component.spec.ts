import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FondoRegistroComponent } from './fondo-registro.component';

describe('FondoRegistroComponent', () => {
  let component: FondoRegistroComponent;
  let fixture: ComponentFixture<FondoRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FondoRegistroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FondoRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
