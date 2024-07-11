import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { FirebaseService } from '../../servicios/firebase.service';
import { HistoriaClinica } from '../../clases/historia-clinica';
import { Turno } from '../../clases/turno';
import { NgFor, NgIf } from '@angular/common';
import { TurnosService } from '../../servicios/turnos.service';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, FormsModule],
  templateUrl: './historia-clinica.component.html',
  styleUrl: './historia-clinica.component.css'
})
export class HistoriaClinicaComponent {
  @Input() turno: Turno | null = null;
  @Output() historiaClinicaCreada = new EventEmitter<void>();
  form: FormGroup;

  constructor(private fb: FormBuilder, private turnosService: TurnosService) {
    this.form = this.fb.group({
      altura: [null, [Validators.required, Validators.min(100), Validators.max(230)]],
      peso: [null, [Validators.required, Validators.min(1), Validators.max(200)]],
      temperatura: [null, [Validators.required, Validators.min(34), Validators.max(42)]],
      presion: [null],
      datosDinamicos: this.fb.array([])
    });
  }

  get datosDinamicos() {
    return this.form.get('datosDinamicos') as FormArray;
  }

  agregarDatoDinamico() {
    if (this.datosDinamicos.length < 3) { // Limitar a 3 elementos
      const nuevoDato = this.fb.group({
        clave: ['', Validators.required],
        valor: ['', Validators.required]
      });
      this.datosDinamicos.push(nuevoDato);
    }
  }

  quitarDatoDinamico(index: number) {
    this.datosDinamicos.removeAt(index);
  }

  onSubmit(): void {
    if (!this.turno || !this.turno.turnoId) {
      console.error('El turno no es válido o no tiene un ID asignado.');
      Swal.fire('Error', 'El ID del turno no es válido.', 'error');
      return;
    }

    const formData = this.form.value;
    const historiaClinicaData = {
      ...formData,
      fechaTurno: this.turno.fecha, // Obtener fecha del turno
      horaTurno: this.turno.hora   // Obtener hora del turno
    };

    this.turnosService.crearHistoriaClinica(this.turno.turnoId, historiaClinicaData).subscribe({
      next: () => {
        console.log('Historia clínica creada correctamente.');
        this.form.reset(); // Reiniciar el formulario después de guardar
        this.historiaClinicaCreada.emit(); // Emitir evento al padre
        Swal.fire('Éxito', 'La historia clínica se ha creado correctamente.', 'success');
      },
      error: (error) => {
        console.error('Error al crear la historia clínica:', error);
        Swal.fire('Error', 'Ocurrió un error al crear la Historia Clínica. Por favor, inténtalo nuevamente.', 'error');
      }
    });
  }
}