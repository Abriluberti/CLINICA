import { Component, Inject, Input, SimpleChanges } from '@angular/core';
import { NgFor, NgIf, DatePipe, SlicePipe, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-paciente-detalle-dialog',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, SlicePipe,FormsModule,ReactiveFormsModule , CommonModule],
  templateUrl: './paciente-detalle-dialog.component.html',
  styleUrls: ['./paciente-detalle-dialog.component.css']
})
export class PacienteDetalleDialogComponent {
  @Input() pacienteSeleccionado: any;

  cerrarDetalle() {
    this.pacienteSeleccionado = null; // Limpiar el paciente al cerrar el detalle
  }
}