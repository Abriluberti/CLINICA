import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Turno } from '../../clases/turno';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-motivo-turno',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,FormsModule],
  templateUrl: './motivo-turno.component.html',
  styleUrl: './motivo-turno.component.css'
})
export class MotivoTurnoComponent {
  motivo: string = '';
  @Input()
  turno!: Turno;
  @Output() motivoIngresado = new EventEmitter<string>();

  confirmarMotivo(): void {
    this.motivoIngresado.emit(this.motivo);
    this.motivo = ''; // Limpiar el campo después de emitir el motivo
  }
}
