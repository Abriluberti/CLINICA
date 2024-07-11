import { NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-fondo-registro',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './fondo-registro.component.html',
  styleUrl: './fondo-registro.component.css'
})
export class FondoRegistroComponent {
  @Output() close = new EventEmitter<void>();
  @Output() especialista = new EventEmitter<void>();
  @Output() paciente = new EventEmitter<void>();

  showTooltipText: string | null = null;

  showTooltip(text: string) {
    this.showTooltipText = text;
  }

  hideTooltip() {
    this.showTooltipText = null;
  }

  handleEspecialista() {
    this.especialista.emit();
  }

  handlePaciente() {
    this.paciente.emit();
  }
}