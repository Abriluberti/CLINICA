import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TurnosService } from '../../servicios/turnos.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-encuesta-atencion',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './encuesta-atencion.component.html',
  styleUrls: ['./encuesta-atencion.component.css']
})
export class EncuestaAtencionComponent {
  formCalificacion: FormGroup;
  @Output() calificacionEnviada: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() turnoId: string | null = null;

  turno: any = { id: null };
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private turnosService: TurnosService,
    private router: Router
  ) {
    this.formCalificacion = this.fb.group({
      calificacion: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
      comentario: ['']
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


  enviarCalificacion(): void {
    // Marcar todos los campos como tocados para activar la validación
    this.formCalificacion.markAllAsTouched();

    if (this.formCalificacion.valid && this.turno.id) {
      const calificacion = this.formCalificacion.get('calificacion')?.value;
      const comentario = this.formCalificacion.get('comentario')?.value;

      console.log('Calificación a enviar:', calificacion);
      console.log('Comentario a enviar:', comentario);

      // Enviar la calificación y el comentario a través del servicio TurnosService
      this.turnosService.calificarTurno(calificacion, comentario).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Calificación enviada',
          text: 'Gracias por calificar su experiencia.'
        });
        this.calificacionEnviada.emit(true); // Emitir el evento de calificación enviada
        this.router.navigate(['/misturnos']);
      }).catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al enviar la calificación. Por favor, intenta nuevamente más tarde.'
        });
        console.error('Error al enviar la calificación:', error);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Por favor complete el formulario correctamente.',
        text: 'Asegúrese de ingresar una calificación válida.'
      });
    }
  }
}