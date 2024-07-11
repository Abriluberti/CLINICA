import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TurnosService } from '../../servicios/turnos.service';
import { NgIf } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import Swal from 'sweetalert2';
import { Turno } from '../../clases/turno';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [NgIf,ReactiveFormsModule],
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.css'
})
export class EncuestaComponent {
  @Input() turnoId: string | null = null;
  formEncuesta: FormGroup;
  formCalificacion: FormGroup;
  indice: number = 0;

  turno: any = { id: null };

  @Output() encuestaEnviada = new EventEmitter<boolean>();
  pregunta1: string = "¿Cómo calificaría la atención recibida?";
  pregunta2: string = "¿Recomendaría la clínica a un amigo o familiar?";
  pregunta3: string = "¿El servicio cumplió sus expectativas?";
  pregunta4: string = "¿Volvería a utilizar el servicio?";

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private turnosService: TurnosService
  ) {
    this.formEncuesta = this.fb.group({
      pregunta1: ['', Validators.required],
      pregunta2: ['', Validators.required],
      pregunta3: ['', Validators.required],
      pregunta4: ['', Validators.required]
    });

    this.formCalificacion = this.fb.group({
      calificacion: [5, Validators.required],
      comentario: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.turnoId) {
      this.turno.id = this.turnoId;
      console.log('ID del turno (Input):', this.turno.id);
    } else {
      this.turno.id = this.route.snapshot.paramMap.get('turnoId');
      console.log('ID del turno (Route):', this.turno.id);
    }

    if (this.turno.id) {
      this.turnosService.getTurnoById(this.turno.id).subscribe(turno => {
        if (turno) {
          this.turno = turno;
          console.log('Datos del turno obtenidos:', this.turno);
        } else {
          console.error('No se encontró el turno con ID:', this.turno.id);
        }
      });
    } else {
      console.error('No se encontró el ID del turno en los parámetros de la ruta.');
    }
  }


  enviarEncuesta(): void {
    if (this.formEncuesta.valid && this.turno.id) {
      const encuestaData = this.formEncuesta.value;
      this.turnosService.completarEncuesta(this.turno.id, encuestaData).then(() => {
        this.encuestaEnviada.emit(true);
        Swal.fire('Encuesta enviada', 'Gracias por completar la encuesta.', 'success');
      }).catch(error => {
        console.error('Error al enviar la encuesta:', error);
        Swal.fire('Error', 'Hubo un error al enviar la encuesta. Por favor, inténtelo nuevamente.', 'error');
        this.encuestaEnviada.emit(false);
      });
    } else {
      console.error('Formulario de encuesta inválido o ID de turno no proporcionado.');
      Swal.fire('Error', 'Formulario de encuesta inválido o ID de turno no proporcionado.', 'error');
    }
  }

  enviarCalificacion(): void {
    if (this.formCalificacion.valid && this.turno?.id) {
      const calificacionData = this.formCalificacion.value;
      console.log('Calificación a enviar:', calificacionData); // Para depuración
      this.turnosService.calificarAtencion(this.turno.id, calificacionData).then(() => {
        Swal.fire('Calificación enviada', 'Calificación enviada exitosamente.', 'success');
      }).catch(error => {
        console.error('Error al enviar la calificación:', error);
        Swal.fire('Error', 'Hubo un error al enviar la calificación. Por favor, inténtelo nuevamente.', 'error');
      });
    } else {
      console.error('Formulario de calificación inválido o ID de turno no proporcionado.');
      Swal.fire('Error', 'Formulario de calificación inválido o ID de turno no proporcionado.', 'error');
    }
  }
  siguiente(): void {
    this.indice++;
  }
  atras(): void {
    this.indice--;
  }
    
  mostrarCompletarEncuesta(): boolean {
    return !!this.turno && this.turno.estado === 'Realizado' && !!this.turno.resena;
  }

  mostrarCalificarAtencion(): boolean {
    return !!this.turno && this.turno.estado === 'Realizado';
  }
}