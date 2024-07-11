import { Component, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Turno } from '../../clases/turno';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { TurnosService } from '../../servicios/turnos.service';
import { PacienteService } from '../../servicios/paciente.service';
import { Paciente } from '../../clases/paciente';
import { HistoriaClinicaComponent } from "../historia-clinica/historia-clinica.component";
import { MotivoTurnoComponent } from "../motivo-turno/motivo-turno.component";

@Component({
    selector: 'app-turnos-especialista',
    standalone: true,
    templateUrl: './turnos-especialista.component.html',
    styleUrls: ['./turnos-especialista.component.css'],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, HistoriaClinicaComponent, MotivoTurnoComponent]
})
export class TurnosEspecialistaComponent implements OnInit {
  turnos: Turno[] = [];
  mostrarHistoriaClinica: boolean = false; // Bandera para mostrar/ocultar el componente de historia clínica

  filtroBusquedaPaciente: string = '';
  filtroBusqueda: string = '';
  especialistaId: string = '';
  turnosFiltrados: any[] = [];
  mostrarCancelarTurno = false;
  mostrarRechazarTurno = false;
  mostrarFinalizarTurno = false;
  filtroPaciente: string = '';
  turnoSeleccionado: any;
  filtro: string = ''; // Variable para el filtro general
  filtroEspecialidad: string = '';
  paciente: Paciente | null = null; // Objeto Paciente para almacenar datos completos del paciente
  mostrarFormularioHistoriaClinica: boolean = false; // Bandera para mostrar el formulario de historia clínica

  uidPaciente: string = ''; 
  
  @Input() pacienteNombre: string = '';
  constructor(
    private turnosService: TurnosService,
    private pacienteService: PacienteService,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    console.log('Inicializando componente TurnosEspecialistaComponent...');
    this.afAuth.authState.subscribe(user => {
      if (user) {
        console.log('Usuario autenticado:', user.uid);
        this.especialistaId = user.uid;
        console.log('Inicialización del componente, pacienteNombre:', this.pacienteNombre);
        this.cargarTodosLosTurnos();
        this.filtrarTurnos();
        this.buscarTurnos();
      } else {
        console.error('No se encontró el usuario autenticado.');
      }
    });
  }

  actualizarPacienteNombre(event: any): void {
    this.pacienteNombre = event.target.value;
  }



  cargarTodosLosTurnos(): void {
    this.firestore.collection('turnos', ref => ref.where('especialistaId', '==', this.especialistaId))
      .get()
      .toPromise()
      .then(snapshot => {
        if (snapshot && !snapshot.empty) {
          this.turnos = snapshot.docs.map(doc => doc.data() as Turno);
          this.filtrarTurnos();
        } else {
          console.log('No se encontraron turnos.');
          this.turnos = [];
          this.turnosFiltrados = [];
        }
      })
      .catch(error => {
        console.error('Error al obtener los turnos:', error);
        this.turnos = [];
        this.turnosFiltrados = [];
      });
  }
  obtenerEspecialidad(turno: Turno): string {
    if (turno.especialidadId && turno.especialidadId) {
      return turno.especialidadId; // Devuelve solo la primera especialidad del array
    } else {
      return 'Especialidad no especificada';
    }
  }
  
  obtenerEspecialistaId(email: string): void {
    this.firestore.collection('especialistas', ref => ref.where('email', '==', email)).get().subscribe(querySnapshot => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          const especialistaData = doc.data();
          this.especialistaId = doc.id;

          this.firestore.collection('pacientes', ref => 
            ref.where('especialistaId', '==', this.especialistaId)
               .where('pacienteNombre', '==', this.pacienteNombre)
          ).get().subscribe(pacientesSnapshot => {
            pacientesSnapshot.forEach(pacienteDoc => {
              const pacienteData = pacienteDoc.data() as Paciente;
              this.uidPaciente = pacienteDoc.id;
              this.paciente = new Paciente(
                this.uidPaciente,
                pacienteData.nombre,
                pacienteData.apellido,
                pacienteData.edad,
                pacienteData.dni,
                pacienteData.obraSocial,
                pacienteData.foto1,
                pacienteData.foto2,
                pacienteData.imageUrl1
              );
              this.pacienteNombre = `${this.paciente.nombre} ${this.paciente.apellido}`;
              console.log('Paciente:', this.paciente);
              this.buscarTurnos();
            });
          });

        });
      } else {
        console.error('No se encontró el especialista con el email proporcionado.');
      }
    });
  }

  obtenerTurnosEspecialista(): void {
    this.buscarTurnos();
  }

  filtrarTurnos(): void {
    if (this.filtro.trim()) {
      const filtro = this.filtro.trim(); // Filtro sin convertir a minúsculas
      this.turnosFiltrados = this.turnos.filter(turno => {
        // Filtrar por cualquier campo del turno y también dentro de la historia clínica
        return this.includesHistoriaClinicaValue(turno.historiaClinica, filtro) ||
          Object.values(turno).some(val => {
            if (Array.isArray(val)) {
              // Si es un array, buscar en cada elemento del array
              return val.some(item => this.includesHistoriaClinicaValue(item, filtro));
            } else if (typeof val === 'object' && val !== null) {
              // Si es un objeto (como historia clínica), buscar en sus propiedades
              return this.buscarEnHistoriaClinica(val, filtro);
            } else if (typeof val === 'string') {
              // Si es una cadena, buscar directamente
              return val.includes(filtro);
            } else if (typeof val === 'number') {
              // Si es un número, buscar directamente
              return String(val).includes(filtro);
            } else {
              return false; // No filtrar otros tipos de datos
            }
          });
      });
    } else {
      this.turnosFiltrados = [...this.turnos]; // Mostrar todos los turnos si no hay filtro
    }
  }
  
  includesHistoriaClinicaValue(item: any, busqueda: string): boolean {
    if (typeof item === 'object' && item !== null) {
      return this.buscarEnHistoriaClinica(item, busqueda); // Buscar dentro del objeto de historia clínica
    } else {
      return String(item).includes(busqueda); // Buscar dentro de un valor primitivo
    }
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
  

  limpiarFiltro(): void {
    this.filtroBusqueda = '';
    this.turnosFiltrados = [...this.turnos]; // Restablecer los turnos filtrados a todos los turnos
  }


 
  buscarTurnos(): void {
    const filtro = this.filtroBusqueda.trim();

    if (filtro) {
      // Determinar automáticamente el tipo de filtro
      let tipoFiltro: 'especialidad' | 'paciente';

      if (isNaN(Number(filtro))) {
        tipoFiltro = 'especialidad';
      } else {
        tipoFiltro = 'paciente';
      }

      this.turnosService.buscarTurnos(
        filtro,
        tipoFiltro,
        this.especialistaId
      ).subscribe(turnos => {
        console.log('Turnos encontrados:', turnos);
        this.turnosFiltrados = turnos;
      }, error => {
        console.error('Error al buscar turnos:', error);
        this.turnosFiltrados = [];
      });
    } else {
      console.warn('El campo de búsqueda está vacío.');
      this.turnosFiltrados = [];
    }
  }
  private esEspecialistaId(filtro: string): boolean {
    // Implementa la lógica para determinar si el filtro es un ID de especialista
    // Aquí devuelvo false como ejemplo
    return false;
  }
   puedeCrearHistoriaClinica(turno: Turno): boolean {
    return turno.estado === 'Realizado' && !turno.historiaClinica;
  }


  onHistoriaClinicaCreada() {
    this.cargarTodosLosTurnos(); // Recargar los turnos después de crear la historia clínica
    this.mostrarHistoriaClinica = false; // Ocultar el componente de historia clínica después de crear la historia
  }
  
  seleccionarTurno(turno: Turno) {
    if (turno && turno.turnoId) { // Verifica que el turno y su ID sean válidos
      console.log('Turno seleccionado:', turno.turnoId);
      this.turnoSeleccionado = turno;
      this.mostrarHistoriaClinica = true;
    } else {
      console.error('El turno no es válido o no tiene un ID asignado.');
      // Puedes manejar el error o mensaje de alguna otra manera según tu aplicación
    }
  }
crearHistoriaClinica(turnoId: string): void {
  if (!turnoId) {
    console.error('El ID del turno está vacío o es undefined.');
    Swal.fire('Error', 'El ID del turno no es válido.', 'error');
    return;
  }

  const altura = Number(prompt('Ingrese la altura (cm):'));
  const peso = Number(prompt('Ingrese el peso (kg):'));
  const temperatura = Number(prompt('Ingrese la temperatura (°C):'));
  let presion = prompt('Ingrese la presión arterial:');

  if (presion === null) {
    presion = ''; // Asignar un valor por defecto si prompt devuelve null
  }

  this.turnosService.actualizarHistoriaClinica(turnoId, altura, peso, temperatura, presion).subscribe(
    (docRef) => {
      console.log('Historia clínica actualizada correctamente. Documento ID:', docRef.id);
      // Puedes realizar acciones adicionales aquí si es necesario
    },
    error => {
      console.error('Error al actualizar historia clínica:', error);
      Swal.fire('Error', 'Ocurrió un error al crear la Historia Clínica. Por favor, inténtalo nuevamente.', 'error');
    }
  );
}


  puedeCancelar(turno: Turno): boolean {
    return turno.estado !== 'Realizado' && turno.estado !== 'Rechazado';
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

  cancelarTurno(turnoId: string): void {
    const motivoInput = Swal.mixin({
      input: 'text',
      confirmButtonText: 'Confirmar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Debes ingresar un motivo!';
        }
        return null; // Debes asegurarte de devolver algo en todos los casos
      }
      
      
    });

    motivoInput.fire({
      title: 'Ingrese el motivo de la cancelación:',
      inputPlaceholder: 'Motivo...',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const comentario = result.value as string;
        this.turnosService.cancelarTurno(turnoId, comentario)
          .then(() => {
            this.cargarTodosLosTurnos();
            Swal.fire('Turno cancelado', '', 'success');
          })
          .catch(error => {
            console.error('Error al cancelar el turno:', error);
            Swal.fire('Error', 'Ocurrió un error al cancelar el turno. Por favor, inténtalo nuevamente.', 'error');
          });
      }
    });
  }

  rechazarTurno(turnoId: string): void {
    const motivoInput = Swal.mixin({
      input: 'text',
      confirmButtonText: 'Confirmar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Debes ingresar un motivo!';
        }
        return null; // Debes asegurarte de devolver algo en todos los casos
      }
      
    });
    motivoInput.fire({
      title: 'Ingrese el motivo del rechazo:',
      inputPlaceholder: 'Motivo...',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const comentario = result.value as string;
        this.turnosService.rechazarTurno(turnoId, comentario)
          .then(() => {
            this.cargarTodosLosTurnos();
            Swal.fire('Turno rechazado', '', 'success');
          })
          .catch(error => {
            console.error('Error al rechazar el turno:', error);
            Swal.fire('Error', 'Ocurrió un error al rechazar el turno. Por favor, inténtalo nuevamente.', 'error');
          });
      }
    });
  }


  aceptarTurno(turnoId: string): void {
    this.turnosService.aceptarTurno(turnoId)
      .then(() => {
        this.cargarTodosLosTurnos();
        Swal.fire('Turno aceptado', '', 'success');
      })
      .catch(error => {
        console.error('Error al aceptar el turno:', error);
        Swal.fire('Error', 'Ocurrió un error al aceptar el turno. Por favor, inténtalo nuevamente.', 'error');
      });
  }

  finalizarTurno(turnoId: string): void {
    const comentarioInput = Swal.mixin({
      input: 'text',
      confirmButtonText: 'Confirmar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Debes ingresar una reseña!';
        }
        return null; // Debes asegurarte de devolver algo en todos los casos
      }
    });
  
    comentarioInput.fire({
      title: 'Ingrese la reseña del turno:',
      inputPlaceholder: 'Reseña...',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const comentario = result.value as string;
        this.turnosService.finalizarTurno(turnoId, comentario)
          .then(() => {
            this.cargarTodosLosTurnos();
            Swal.fire('Turno finalizado', '', 'success');
          })
          .catch(error => {
            console.error('Error al finalizar el turno:', error);
            Swal.fire('Error', 'Ocurrió un error al finalizar el turno. Por favor, inténtalo nuevamente.', 'error');
          });
      }
    });
  }
  verResena(turno: Turno): void {
    Swal.fire({
      title: 'Reseña del turno',
      text: turno.resena || 'No hay reseña disponible',
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
}
}
