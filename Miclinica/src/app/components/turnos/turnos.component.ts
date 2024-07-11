import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../servicios/turnos.service';
import { Turno } from '../../clases/turno';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { Paciente } from '../../clases/paciente';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HoverTraceDirectiveDirective } from '../../directives/hover-trace-directive.directive';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, HoverTraceDirectiveDirective ],
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css']
})
export class TurnosComponent implements OnInit {
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  filtroBusqueda: string = '';
  especialistaId: string = '';

  @Input() pacienteNombre: string = '';

  constructor(private turnosService: TurnosService, private afAuth: AngularFireAuth) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.especialistaId = user.uid;
        this.obtenerTurnos();
        this.filtrarTurnos();
      } else {
        console.error('No se encontró el usuario autenticado.');
      }
    });
  }

  obtenerTurnos(): void {
    this.turnosService.getTurnos().subscribe(turnos => {
      this.turnos = turnos;
      this.filtrarTurnos();
    });
  }

  buscarTurnos(): void {
    this.filtrarTurnos();
  }

  filtrarTurnos(): void {
    if (this.filtroBusqueda.trim() !== '') {
      const busqueda = this.filtroBusqueda.trim().toLowerCase();
      this.turnosFiltrados = this.turnos.filter(turno => {
        const especialidadMatches = turno.especialidades?.some(especialidad => especialidad.toLowerCase().includes(busqueda)) || false;
        const especialistaMatches = turno.especialistaNombre?.toLowerCase().includes(busqueda) || false;
        return especialidadMatches || especialistaMatches;
      });
    } else {
      this.turnosFiltrados = this.turnos;
    }
  }

  puedeCancelar(turno: Turno): boolean {
    return turno.estado === 'Pendiente';
  }

  confirmarCancelarTurno(turnoId: string): void {
    console.log('ID del turno a cancelar:', turnoId); // Verifica el ID que estás pasando
    const confirmOptions: SweetAlertOptions = {
      title: `¿Estás seguro de cancelar el turno ?`,
      input: 'text',
      inputPlaceholder: 'Motivo de la cancelación',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Debes ingresar un motivo!';
        }
        return null; // Devolver null si la validación es exitosa
      }
    };
  
    Swal.fire(confirmOptions).then((result) => {
      if (result.isConfirmed) {
        this.cancelarTurno(turnoId, result.value);
      }
    });
  }
  

  cancelarTurno(turnoId: string, comentario: string): void {
    console.log('Cancelando turno con ID:', turnoId);
    this.turnosService.cancelarTurno(turnoId, comentario)
      .then(() => {
        Swal.fire('Turno cancelado', '', 'success');
        // Aquí puedes actualizar la lista de turnos si es necesario
      })
      .catch(error => {
        console.error('Error al cancelar el turno:', error);
        Swal.fire('Error', 'Ocurrió un error al cancelar el turno. Por favor, inténtalo nuevamente.', 'error');
      });
  }
  
}