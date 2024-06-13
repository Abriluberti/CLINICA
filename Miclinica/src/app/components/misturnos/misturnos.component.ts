import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Turno } from '../../models/turno.model';
import { TurnosService } from '../../servicios/turnos.service';

@Component({
  selector: 'app-misturnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './misturnos.component.html',
  styleUrls: ['./misturnos.component.css']
})
export class MisturnosComponent implements OnInit {
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  turnoBuscado: Turno | null = null;
  filtroEspecialidad: string = '';
  filtroEspecialista: string = '';
  pacienteUid: string = ''; // Cambiado de pacienteEmail a pacienteUid
  busquedaRealizada: boolean = false; // Variable para controlar si se realizó una búsqueda
  mostrarListaTurnos: boolean = false; // Variable para controlar si se muestra la lista de turnos filtrados

  constructor(
    private afAuth: AngularFireAuth,
    private turnosService: TurnosService
  ) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) { // Cambiado de user.email a user.uid
        this.pacienteUid = user.uid; // Cambiado de pacienteEmail a pacienteUid
        console.log('UID del paciente:', this.pacienteUid); // Verificar el UID del paciente
        this.obtenerTurnos();
      }
    });
  }

  obtenerTurnos() {
    this.turnosService.getTurnosPaciente(this.pacienteUid) // Cambiado de pacienteEmail a pacienteUid
      .subscribe((turnos: Turno[]) => {
        console.log('Turnos del paciente:', turnos); // Verificar los turnos recuperados del servicio
        this.turnos = turnos;
        this.turnosFiltrados = turnos;
      });
  }

  buscarTurnos() {
    if (this.filtroEspecialidad && this.filtroEspecialista) {
      const especialidad = this.filtroEspecialidad.trim().toLowerCase();
      const especialista = this.filtroEspecialista.trim().toLowerCase();
  
      console.log('Especialidad filtrada:', especialidad);
      console.log('Especialista filtrado:', especialista);
  
      this.turnosFiltrados = this.turnos.filter(turno => {
        // Verificar si las propiedades están definidas antes de acceder a ellas
        if (turno.especialidadId && turno.especialistaId) {
          const especialidadTurno = turno.especialidadId.trim().toLowerCase();
          const especialistaTurno = turno.especialistaId.trim().toLowerCase();
          console.log('Especialidad del turno:', especialidadTurno);
          console.log('Especialista del turno:', especialistaTurno);
          return especialidadTurno === especialidad && especialistaTurno === especialista;
        } else {
          return false; // Si alguna propiedad no está definida, filtramos el turno
        }
      });
  
      console.log('Turnos filtrados:', this.turnosFiltrados); // Verificar los turnos filtrados
  
      // Mostrar la lista de turnos filtrados solo si se encontraron resultados
      this.mostrarListaTurnos = this.turnosFiltrados.length > 0;
  
      if (this.turnosFiltrados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No hay turnos',
          text: 'No se encontraron turnos para el especialista y especialidad seleccionados.'
        });
      }
  
      // Marcar que se ha realizado una búsqueda
      this.busquedaRealizada = true;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes ingresar la especialidad y el especialista para buscar turnos.'
      });
    }
  }
  
  mostrarCancelar(estado: string): boolean {
    return estado !== 'Realizado';
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

  verResena(turno: Turno): void {
    Swal.fire('Reseña', turno.resena || 'No hay reseña disponible', 'info');
  }

  completarEncuesta(turno: Turno): void {
    Swal.fire('Encuesta', 'Aquí puedes completar la encuesta.', 'info');
  }

  calificarAtencion(turno: Turno): void {
    // Lógica para calificar la atención
  }
}
