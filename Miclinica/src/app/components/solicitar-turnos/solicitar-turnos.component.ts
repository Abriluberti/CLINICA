import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { v4 as uuidv4 } from 'uuid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { Especialista } from '../../clases/especialista';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { Horario } from '../../clases/horario';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitar-turnos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './solicitar-turnos.component.html',
  styleUrls: ['./solicitar-turnos.component.css']
})
export class SolicitarTurnosComponent implements OnInit, OnDestroy {
  especialistas$: Observable<Especialista[]> | null = null;
  pacientes$: Observable<any[]> | null = null;
  pacienteSeleccionado: any | null = null;
  pacienteNombre: string | null = null;
  especialidadSeleccionada: string | null = null;
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  especialistaSeleccionado: Especialista | null = null;
  especialidadesEspecialista: string[] = [];
  horariosDisponibles: string[] = [];
  isAdmin: boolean = false;
  fechasDisponibles: string[] = [];
  imageUrl1: string | null = null;
  especialistaNombre: string | null = null;
  private unsubscribe$ = new Subject<void>();

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) {}

  ngOnInit(): void {
    console.log('ngOnInit');
    this.afAuth.authState.pipe(takeUntil(this.unsubscribe$)).subscribe(user => {
      if (user) {
        console.log('Usuario autenticado:', user.uid);
        this.firestore.collection('administradores').doc(user.uid).valueChanges().pipe(take(1), takeUntil(this.unsubscribe$)).subscribe((adminData: any) => {
          if (adminData) {
            this.isAdmin = true;
            console.log('El usuario es administrador');
            this.pacientes$ = this.firestore.collection('pacientes').valueChanges({ idField: 'uid' }) as Observable<any[]>;
          } else {
            this.isAdmin = false;
            console.log('El usuario no es administrador');
            this.firestore.collection('pacientes').doc(user.uid).valueChanges().pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
              if (data) {
                this.pacienteNombre = data.nombre || null;
                console.log('Nombre del paciente:', this.pacienteNombre);
              }
            });
          }
        });

        this.especialistas$ = this.firestore.collection('especialistas').valueChanges({ idField: 'uid' }).pipe(
          map((especialistas: any[]) => especialistas.map(especialista => {
            let especialidades: string[] = [];
            let turnos: Horario[] = [];
            if (!especialista.especialidades) {
              especialista.especialidades = [];
            }
            if (especialista.especialidad) {
              especialista.especialidades.push(especialista.especialidad);
            }
            if (especialista.turnos) {
              turnos = especialista.turnos.map((turno: any) => new Horario(turno.especialidades, turno.turno));
            }
            return new Especialista(
              especialista.uid,
              especialista.nombre,
              especialista.apellido,
              especialista.edad,
              especialista.dni,
              especialista.especialidades,
              especialista.especialidad,
              especialista.imageUrl1,
              especialista.verificado,
              turnos
            );
          }))
        ) as Observable<Especialista[]>;

      } else {
        console.log('No hay usuario autenticado');
        this.isAdmin = false;
        this.pacienteNombre = null;
      }
    });

    this.generarFechasDisponibles();
  }

  especialidades = [
    { nombre: 'Dentista', imagenUrl: 'assets/especialidades/dentista.png' },
    { nombre: 'Pediatría', imagenUrl: 'assets/especialidades/Pediatra.png' },
    { nombre: 'Cardiología', imagenUrl: 'assets/especialidades/Cardiología.png' },
    { nombre: 'Dermatología', imagenUrl: 'assets/especialidades/dermatologia.png' },
    { nombre: 'Neurología', imagenUrl: 'assets/especialidades/neurologia.png' },
    { nombre: 'Imagen por defecto', imagenUrl: 'assets/especialidades/default.png' }
  ];

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  seleccionarEspecialidad(especialidad: string): void {
    this.especialidadSeleccionada = especialidad;
    console.log('Especialidad seleccionada:', especialidad);
    this.cargarHorariosDisponibles();
  }
  
  generarFechasDisponibles(): void {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 15);
    const dateArray = this.getDatesBetween(today, endDate);
    this.fechasDisponibles = dateArray.map(date => this.formatDate(date));
  }

  getDatesBetween(startDate: Date, endDate: Date): Date[] {
    const dates = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  cargarEspecialidades(): void {
    if (this.especialistaSeleccionado) {
      this.especialidadesEspecialista = this.especialistaSeleccionado.especialidades || [];
    } else {
      this.especialidadesEspecialista = [];
    }
    console.log('Especialidades del especialista seleccionado:', this.especialidadesEspecialista);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getEspecialidadImage(especialidad: string): string {
    const especialidadEncontrada = this.especialidades.find(e => e.nombre === especialidad);
    return especialidadEncontrada ? especialidadEncontrada.imagenUrl : 'assets/especialidades/default.png';
  }

  cargarHorariosDisponibles(): void {
    if (this.especialistaSeleccionado && this.especialidadSeleccionada) {
      const turnoEspecialidad = this.especialistaSeleccionado.turnos.find(turno => turno.especialidad === this.especialidadSeleccionada);
      if (turnoEspecialidad && turnoEspecialidad.turno) {
        if (turnoEspecialidad.turno.manana) {
          this.horariosDisponibles = this.generarHorarios('05:00', '12:00');
        } else if (turnoEspecialidad.turno.tarde) {
          this.horariosDisponibles = this.generarHorarios('13:00', '20:00');
        } else if (turnoEspecialidad.turno.noche) {
          this.horariosDisponibles = this.generarHorarios('21:00', '04:00');
        } else {
          this.horariosDisponibles = [];
        }
      } else {
        this.horariosDisponibles = [];
      }
    } else {
      this.horariosDisponibles = [];
    }
    console.log('Horarios disponibles:', this.horariosDisponibles);
  }

  generarHorarios(inicio: string, fin: string): string[] {
    const horarios: string[] = [];
    const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
    const [horaFin, minutoFin] = fin.split(':').map(Number);

    let horaActual = new Date();
    horaActual.setHours(horaInicio, minutoInicio, 0, 0);

    const horaFinal = new Date();
    horaFinal.setHours(horaFin, minutoFin, 0, 0);

    if (horaFinal < horaActual) {
      horaFinal.setDate(horaFinal.getDate() + 1);
    }

    while (horaActual <= horaFinal) {
      horarios.push(horaActual.toTimeString().substring(0, 5));
      horaActual.setMinutes(horaActual.getMinutes() + 30);
    }

    return horarios;
  }

  cargarImagenEspecialista(): void {
    if (this.especialistaSeleccionado) {
      this.imageUrl1 = this.especialistaSeleccionado.imageUrl1;
      this.especialistaNombre = this.especialistaSeleccionado.nombre;
    } else {
      this.imageUrl1 = null;
      this.especialistaNombre = null;
    }
    console.log('Imagen y nombre del especialista seleccionado:', this.imageUrl1, this.especialistaNombre);
  }

  seleccionarPaciente(paciente: any): void {
    this.pacienteSeleccionado = paciente;
    if (paciente) {
      this.pacienteNombre = paciente.nombre || '';
    } else {
      this.pacienteNombre = null;
    }
    console.log('Paciente seleccionado:', this.pacienteSeleccionado);
  }

  async solicitarTurno(): Promise<void> {
    console.log('Iniciando solicitud de turno...');
    try {
      const user = await this.afAuth.currentUser;
      if (!user) {
        console.error('No hay usuario autenticado');
        throw new Error('No hay usuario autenticado.');
      }
  
      let pacienteId = '';
      let pacienteNombre = '';
      if (this.isAdmin && this.pacienteSeleccionado) {
        pacienteId = this.pacienteSeleccionado.uid;
        pacienteNombre = this.pacienteSeleccionado.nombre || '';
      } else {
        pacienteId = user.uid;
        pacienteNombre = this.pacienteNombre || '';
      }
  
      console.log('Datos del turno:', {
        especialistaSeleccionado: this.especialistaSeleccionado,
        fechaSeleccionada: this.fechaSeleccionada,
        horaSeleccionada: this.horaSeleccionada,
        pacienteId: pacienteId,
        pacienteNombre: pacienteNombre,
        especialidadSeleccionada: this.especialidadSeleccionada  // Añade la especialidad seleccionada
      });
  
      if (!this.especialistaSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada || !pacienteId || !pacienteNombre || !this.especialidadSeleccionada) {
        console.error('Error: Todos los campos son requeridos.', {
          especialistaSeleccionado: this.especialistaSeleccionado,
          fechaSeleccionada: this.fechaSeleccionada,
          horaSeleccionada: this.horaSeleccionada,
          pacienteId: pacienteId,
          pacienteNombre: pacienteNombre,
          especialidadSeleccionada: this.especialidadSeleccionada
        });
        throw new Error('Todos los campos son requeridos.');
      }
  
      const turnoId = uuidv4();
      console.log('Generando turno con ID:', turnoId);
  
      await this.firestore.collection('turnos').doc(turnoId).set({
        turnoId: turnoId,
        pacienteNombre: pacienteNombre,
        pacienteId: pacienteId,
        especialidadId: this.especialidadSeleccionada,  // Utiliza la especialidad seleccionada
        especialistaId: this.especialistaSeleccionado.uid,
        especialidades: this.especialidadesEspecialista,
        especialistaNombre: `${this.especialistaSeleccionado.nombre} ${this.especialistaSeleccionado.apellido}`,
        fecha: this.fechaSeleccionada,
        hora: this.horaSeleccionada,
        estado: 'Pendiente'
      });
  
      console.log('Turno solicitado con éxito, turnoId:', turnoId);
  
      Swal.fire({
        icon: 'success',
        title: '¡Turno solicitado!',
        text: 'El turno ha sido solicitado con éxito.',
        confirmButtonText: 'Aceptar'
      });
  
      // Reset form
      this.especialistaSeleccionado = null;
      this.especialidadSeleccionada = null;
      this.fechaSeleccionada = '';
      this.horaSeleccionada = '';
      this.pacienteSeleccionado = null;
      this.pacienteNombre = null;
      this.especialidadesEspecialista = [];
      this.horariosDisponibles = [];
    } catch (error) {
      console.error('Error al solicitar turno:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al solicitar el turno. Por favor, intenta nuevamente más tarde.',
        confirmButtonText: 'Aceptar'
      });
    }
  }
  

  seleccionarEspecialista(especialista: Especialista): void {
    this.especialistaSeleccionado = especialista;
    console.log('Especialista seleccionado:', especialista);
    this.cargarEspecialidades();
    this.cargarImagenEspecialista();
  }



  seleccionarFecha(fecha: string): void {
    this.fechaSeleccionada = fecha;
    console.log('Fecha seleccionada:', fecha);
  }
// Añade métodos para verificar si la fecha y la hora están seleccionadas
esFechaSeleccionada(fecha: string): boolean {
  return this.fechaSeleccionada === fecha;
}

esHoraSeleccionada(hora: string): boolean {
  return this.horaSeleccionada === hora;
}

  seleccionarHora(hora: string): void {
    this.horaSeleccionada = hora;
    console.log('Hora seleccionada:', hora);
  }
}
