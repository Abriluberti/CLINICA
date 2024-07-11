import { Component } from '@angular/core';
import { PacientesComponent } from "../pacientes/pacientes.component";
import { PacienteDetalleDialogComponent } from "../paciente-detalle-dialog/paciente-detalle-dialog.component";
import { MatDialog } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-pacientes-especialistas',
  standalone: true,
  imports: [PacientesComponent, PacienteDetalleDialogComponent],
  templateUrl: './pacientes-especialistas.component.html',
  styleUrl: './pacientes-especialistas.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]

})
export class PacientesEspecialistasComponent {
  pacienteSeleccionado: any;

  abrirDetallePaciente(paciente: any): void {
    console.log('Abrir detalle del paciente:', paciente);
    this.pacienteSeleccionado = paciente;
  }

  cerrarDetalle(): void {
    this.pacienteSeleccionado = null;
  }
}