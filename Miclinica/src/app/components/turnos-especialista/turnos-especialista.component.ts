import { Component } from '@angular/core';
import { Turno } from '../../models/turno.model';
import { TurnosService } from '../../servicios/turnos.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PacienteService } from '../../servicios/paciente.service';

@Component({
  selector: 'app-turnos-especialista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './turnos-especialista.component.html',
  styleUrls: ['./turnos-especialista.component.css']
})
export class TurnosEspecialistaComponent {
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  filtroEspecialidad: string = '';
  filtroPaciente: string = '';
  especialistaId: string = '';

  filtroPacienteNombre: string = '';
  filtroPacienteApellido: string = '';

  constructor(private turnosService: TurnosService, private pacienteService: PacienteService) {}

  ngOnInit(): void {
    this.obtenerTurnos();
  }

  obtenerTurnosEspecialista(): void {
    this.turnosService.getTurnosEspecialista(this.especialistaId).subscribe(turnos => {
      this.turnos = turnos;
      this.filtrarTurnos();
    });
  }

  filtrarTurnos(): void {
    this.turnosFiltrados = this.turnos.filter(turno =>
      turno.especialidadId.toLowerCase().includes(this.filtroEspecialidad.toLowerCase()) &&
      (turno.paciente ? turno.paciente.toLowerCase().includes(this.filtroPaciente.toLowerCase()) : false)
    );
  }

  cancelarTurno(turnoId: string): void {
    const comentario = prompt('Ingrese el motivo de la cancelación:');
    if (comentario) {
      this.turnosService.cancelarTurno(turnoId, comentario)
        .then(() => {
          this.turnos = this.turnos.filter(turno => turno.id !== turnoId);
          this.buscarTurnos();
        })
        .catch(error => {
          console.error('Error al cancelar turno:', error);
        });
    }
  }

  rechazarTurno(turnoId: string): void {
    const comentario = prompt('Ingrese el motivo del rechazo:');
    if (comentario) {
      this.turnosService.rechazarTurno(turnoId, comentario).then(() => {
        this.obtenerTurnosEspecialista();
        Swal.fire('Turno rechazado', '', 'success');
      }).catch(error => {
        console.error('Error al rechazar turno:', error);
        Swal.fire('Error', 'Ocurrió un error al rechazar el turno. Por favor, inténtalo nuevamente.', 'error');
      });
    }
  }

  aceptarTurno(turnoId: string): void {
    this.turnosService.aceptarTurno(turnoId).then(() => {
      console.log('Turno aceptado con éxito.');
      // Realiza las acciones adicionales necesarias después de aceptar el turno
    }).catch(error => {
      console.error('Error al aceptar turno:', error);
      // Maneja el error de manera apropiada
    });
  }

  finalizarTurno(turnoId: string): void {
    const comentario = prompt('Ingrese la reseña o comentario del turno:');
    if (comentario) {
      this.turnosService.finalizarTurno(turnoId, comentario).then(() => {
        this.obtenerTurnosEspecialista();
        Swal.fire('Turno finalizado', '', 'success');
      }).catch(error => {
        console.error('Error al finalizar turno:', error);
        Swal.fire('Error', 'Ocurrió un error al finalizar el turno. Por favor, inténtalo nuevamente.', 'error');
      });
    }
  }

  verResena(turno: Turno): void {
    alert(turno.resena || 'No hay reseña disponible');
  }

  puedeCancelar(turno: Turno): boolean {
    return turno.estado !== 'Aceptado' && turno.estado !== 'Realizado' && turno.estado !== 'Rechazado';
  }

  puedeRechazar(turno: Turno): boolean {
    return turno.estado !== 'Aceptado' && turno.estado !== 'Realizado' && turno.estado !== 'Cancelado';
  }

  puedeAceptar(turno: Turno): boolean {
    return turno.estado !== 'Realizado' && turno.estado !== 'Cancelado' && turno.estado !== 'Rechazado';
  }

  puedeFinalizar(turno: Turno): boolean {
    return turno.estado === 'Aceptado';
  }

  tieneResena(turno: Turno): boolean {
    return !!turno.resena;
  }

  obtenerTurnos(): void {
    this.turnosService.getTurnos().subscribe(turnos => {
      this.turnos = turnos;
    });
  }

  buscarTurnos(): void {
    if (this.filtroPacienteNombre.trim() === '' || this.filtroPacienteApellido.trim() === '') {
      console.log('Por favor, ingrese el nombre y el apellido del paciente.');
      return;
    }

    console.log('Buscando turnos para el paciente:', this.filtroPacienteNombre, this.filtroPacienteApellido);
    this.pacienteService.buscarPacientePorNombreYApellido(this.filtroPacienteNombre, this.filtroPacienteApellido)
      .subscribe((pacientes: any[]) => {
        console.log('Paciente encontrado:', pacientes);
        if (pacientes.length > 0) {
          const pacienteUid = pacientes[0].uid;
          console.log('UID del paciente encontrado:', pacienteUid);
          this.turnosFiltrados = this.turnos.filter(turno =>
            turno.especialidadId.toLowerCase().includes(this.filtroEspecialidad.toLowerCase()) &&
            (turno.pacienteId === pacienteUid)
          );

          console.log('Turnos filtrados para el paciente:', this.turnosFiltrados);

          if (this.turnosFiltrados.length === 0) {
            console.log('No se encontraron turnos para el paciente.');
          }
        } else {
          console.log('No se encontró ningún paciente con el nombre y apellido proporcionados.');
        }
      });
  }
}
