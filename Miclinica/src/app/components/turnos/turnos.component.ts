import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TurnosService } from '../../servicios/turnos.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Turno } from '../../models/turno.model';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.css'
})
export class TurnosComponent implements OnInit {
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  filtroEspecialidad: string = '';
  filtroEspecialista: string = '';

  constructor(private turnosService: TurnosService) {}

  ngOnInit(): void {
    this.obtenerTurnos();
  }

  obtenerTurnos() {
    this.turnosService.getTurnos().subscribe(turnos => {
      this.turnos = turnos;
    });
  }

  filtrarTurnos() {
    this.turnosFiltrados = this.turnos.filter(turno => {
      const especialidad = turno.especialidadId.toLowerCase();
      const especialista = turno.especialistaId.toLowerCase();
      const filtroEspecialidad = this.filtroEspecialidad.toLowerCase();
      const filtroEspecialista = this.filtroEspecialista.toLowerCase();
      const estado = turno.estado.toLowerCase(); // Convertir el estado a minúsculas
  
      // Excluir los turnos cancelados de la lista filtrada
      if (estado === 'cancelado') {
        return false;
      }
  
      return especialidad.includes(filtroEspecialidad) && especialista.includes(filtroEspecialista);
    });
  }
  

  mostrarCancelar(estado: string): boolean {
    return estado !== 'Aceptado' && estado !== 'Realizado' && estado !== 'Rechazado';
  }

  cancelarTurno(turnoId: string) {
    const comentario = prompt('Ingrese el motivo de la cancelación:');
    if (comentario) {
      this.turnosService.cancelarTurno(turnoId, comentario).then(() => {
        this.obtenerTurnos(); // Actualizar la lista de turnos después de cancelar uno
      }).catch(error => {
        console.error('Error al cancelar turno:', error);
        Swal.fire('Error', 'Ocurrió un error al cancelar el turno. Por favor, inténtalo nuevamente.', 'error');
      });
    }
  }

  buscarTurnos() {
    // Aquí implementa la lógica para buscar turnos según la especialidad y el especialista
    // Utiliza la función filtrarTurnos() para aplicar los filtros
    this.filtrarTurnos();
  }
}