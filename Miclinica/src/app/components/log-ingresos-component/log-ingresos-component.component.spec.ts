import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogIngresosComponentComponent } from './log-ingresos-component.component';

describe('LogIngresosComponentComponent', () => {
  let component: LogIngresosComponentComponent;
  let fixture: ComponentFixture<LogIngresosComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogIngresosComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogIngresosComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
