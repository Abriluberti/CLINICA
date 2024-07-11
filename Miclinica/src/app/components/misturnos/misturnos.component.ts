import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TurnosService } from '../../servicios/turnos.service';
import { Turno } from '../../clases/turno';
import { Router } from '@angular/router';
import { EncuestaComponent } from "../encuesta/encuesta.component";
import { EncuestaAtencionComponent } from "../encuesta-atencion/encuesta-atencion.component";

@Component({
    selector: 'app-misturnos',
    standalone: true,
    templateUrl: './misturnos.component.html',
    styleUrls: ['./misturnos.component.css'],
    imports: [CommonModule, FormsModule, EncuestaComponent, EncuestaAtencionComponent]
})
export class MisturnosComponent implements OnInit {
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  filtroBusqueda: string = '';
  @Input() turnoId!: string;
  mostrarCalificacion: boolean = false;
  pacienteUid: string = '';
  busquedaRealizada: boolean = false;
  mostrarEncuesta: boolean = false; // Bandera para controlar la visibilidad de la encuesta
  turnoSeleccionado: Turno | null = null; // Turno seleccionado para la encuesta

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private turnosService: TurnosService
  ) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.pacienteUid = user.uid;
        this.obtenerTurnos();
      }
    });
  }

  obtenerTurnos() {
    this.turnosService.getTurnosPaciente(this.pacienteUid).subscribe(
      (turnos: Turno[]) => {
        console.log('Turnos del paciente:', turnos);
        this.turnos = turnos.map(turno => ({
          ...turno,
          especialistaNombre: turno.especialistaNombre || ''
        }));
        this.turnosFiltrados = this.turnos; // Mostrar todos los turnos inicialmente
        this.busquedaRealizada = true; // Indicar que la carga de turnos ha sido realizada
      },
      error => {
        console.error('Error al obtener los turnos del paciente:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al cargar los turnos. Por favor, intenta nuevamente más tarde.'
        });
      }
    );
  }

  filtrarTurnos() {
    if (this.filtroBusqueda.trim() !== '') {
      const busqueda = this.filtroBusqueda.trim();
      this.turnosFiltrados = this.turnos.filter(turno =>
        this.filtrarTurnoPorCampo(turno, busqueda)
      );
    } else {
      this.turnosFiltrados = this.turnos;
    }
  }

  filtrarTurnoPorCampo(turno: Turno, busqueda: string): boolean {
    // Verifica si alguna propiedad del turno coincide con la búsqueda
    return (
      turno.especialidades?.some(especialidad =>
        especialidad.includes(busqueda)
      ) ||
      turno.especialistaNombre?.includes(busqueda) ||
      turno.fecha?.includes(busqueda) ||
      turno.hora?.includes(busqueda) ||
      this.buscarEnHistoriaClinica(turno.historiaClinica, busqueda) ||
      turno.estado?.includes(busqueda)
   
    );
  }

  buscarEnHistoriaClinica(historiaClinica: any, busqueda: string): boolean {
    // Verifica si alguna propiedad de la historia clínica coincide con la búsqueda
    if (!historiaClinica) {
      return false;
    }
  
    // Recorrer todas las propiedades del objeto historiaClinica
    for (const key of Object.keys(historiaClinica)) {
      const value = historiaClinica[key];
  
      // Si el valor es un objeto, buscar en sus propiedades recursivamente
      if (typeof value === 'object' && value !== null) {
        if (this.buscarEnObjeto(value, busqueda)) {
          return true;
        }
      } else {
        // Si el valor es una cadena, número u otro tipo primitivo, realizar la búsqueda
        if (value.toString().includes(busqueda)) {
          return true;
        }
      }
    }
  
    return false;
  }
  
  buscarEnObjeto(objeto: any, busqueda: string): boolean {
    // Recorrer todas las propiedades del objeto
    for (const key of Object.keys(objeto)) {
      const value = objeto[key];
  
      // Si el valor es un objeto, buscar en sus propiedades recursivamente
      if (typeof value === 'object' && value !== null) {
        if (this.buscarEnObjeto(value, busqueda)) {
          return true;
        }
      } else {
        // Si el valor es una cadena, número u otro tipo primitivo, realizar la búsqueda
        if (value.toString().includes(busqueda)) {
          return true;
        }
      }
    }
  
    return false;
  }
  
  
  mostrarCancelar(estado: string): boolean {
    return estado !== 'Realizado';
  }

  cancelarTurno(turnoId: string): void {
    const comentario = prompt('Ingrese el motivo de la cancelación:');
    if (comentario) {
      this.turnosService.cancelarTurno(turnoId, comentario).then(() => {
        // Remover el turno cancelado de la lista de turnos
        this.turnos = this.turnos.filter(turno => turno.id !== turnoId);
        this.turnosFiltrados = this.turnosFiltrados.filter(
          turno => turno.id !== turnoId
        );
        Swal.fire({
          icon: 'success',
          title: 'Turno cancelado',
          text: 'El turno ha sido cancelado correctamente.'
        });
      }).catch(error => {
        console.error('Error al cancelar turno:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al cancelar el turno. Por favor, intenta nuevamente más tarde.'
        });
      });
    }
  }

  verResena(turno: Turno): void {
    Swal.fire('Reseña', turno.resena || 'No hay reseña disponible', 'info');
  }

  completarEncuesta(turno: Turno): void {
    this.turnoSeleccionado = turno; // Guardar el turno seleccionado
    this.mostrarEncuesta = true; // Mostrar la encuesta
  }

  calificarAtencion(turno: Turno): void {
    this.turnoSeleccionado = turno; // Guardar el turno seleccionado
    this.mostrarCalificacion = true; // Mostrar el formulario de calificación
  }

// En algún lugar del componente, donde determines que se debe mostrar la calificación
mostrarCalificacionParaTurno(turno: Turno): void {
  this.mostrarCalificacion = true; // Puedes establecer esta bandera según tus condiciones
  this.turnoSeleccionado = turno; // Estableces el turno seleccionado para la calificación
}

calificacionEnviada(resultado: boolean): void {
  // Lógica después de que se envía la calificación
  console.log('Calificación enviada:', resultado);
  this.mostrarCalificacion = false; // Ocultas el formulario de calificación
  this.turnoSeleccionado = null; // Reseteas el turno seleccionado
}

  encuestaEnviada(resultado: boolean): void {
    // Aquí puedes manejar la lógica después de enviar la encuesta
    // Por ejemplo, cerrar la encuesta o actualizar algún estado
    console.log('Encuesta enviada:', resultado);
    this.mostrarEncuesta = false; // Ocultar la encuesta cuando se envía
    this.turnoSeleccionado = null; // Resetear el turno seleccionado
  }

  mostrarEncuestaParaTurno(turno: Turno): void {
    this.mostrarEncuesta = true; // Mostrar la encuesta
    this.turnoSeleccionado = turno; // Guardar el turno seleccionado
  }


}