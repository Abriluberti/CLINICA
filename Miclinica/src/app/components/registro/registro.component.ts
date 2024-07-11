import { Component, NgModule } from '@angular/core';
import { FirebaseService } from '../../servicios/firebase.service';
import { LoadingService } from '../../servicios/loading.service'; // Importa el servicio de carga
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';

import Swal from 'sweetalert2';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [NgIf, FormsModule, AsyncPipe,  RecaptchaModule, RecaptchaFormsModule, ReactiveFormsModule],
  templateUrl:'./registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  paciente = {
    nombre: '',
    apellido: '',
    edad: null,
    dni: null,
    obraSocial: '',
    email: '',
    password: ''
  };

  selectedPacienteFiles: { [key: number]: File } = {}; // Cambiar a objeto para manejar múltiples archivos
  errorMessage: string = '';
  captchaError: boolean = false;
  captchaResolved: boolean = false;
  successMessage: string = '';
  loading$ = this.loadingService.loading$;
  pacienteForm!: FormGroup;

  constructor(
    private firebaseService: FirebaseService,
    private loadingService: LoadingService
  ) {
    this.pacienteForm = new FormGroup({
      nombre: new FormControl(this.paciente.nombre, Validators.required),
      apellido: new FormControl(this.paciente.apellido, Validators.required),
      edad: new FormControl(this.paciente.edad, [Validators.required, Validators.min(0)]),
      dni: new FormControl(this.paciente.dni, Validators.required),
      obraSocial: new FormControl(this.paciente.obraSocial, Validators.required),
      email: new FormControl(this.paciente.email, [Validators.required, Validators.email]),
      password: new FormControl(this.paciente.password, Validators.required),
      recaptcha: new FormControl('', Validators.required)
    });
  }


  onFileSelected(event: any, fileIndex: number) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPacienteFiles[fileIndex] = file;
    }
  }

  onCaptchaResolved(captchaResponse: string) {
    this.pacienteForm.patchValue({ recaptcha: captchaResponse });
    this.captchaError = false;
    this.captchaResolved = true; // Marca el reCAPTCHA como completado correctamente
  }

  async registerPatient(event: Event) {
    event.preventDefault();
      // Verifica que el reCAPTCHA se haya completado correctamente
      if (!this.captchaResolved) {
        this.errorMessage = 'Debe completar el reCAPTCHA para registrar al especialista.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
        });
        return; // Evita seguir con el registro si no se completó el reCAPTCHA
      }
    const files = Object.values(this.selectedPacienteFiles);
    if (files.length >= 2) {
      this.loadingService.show();
      try {
        const [file1, file2] = files;
        await this.firebaseService.registerPatient(this.paciente, file1, file2);
        this.successMessage = 'Paciente registrado con éxito';
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: this.successMessage,
        });
        this.resetForm();
      } catch (error) {
        console.error('Error al registrar paciente:', error);
        this.errorMessage = 'Error al registrar paciente: ' + error;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
        });
      } finally {
        this.loadingService.hide();
      }
    } else {
      this.errorMessage = 'Se requieren al menos dos imágenes para el perfil del paciente.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.errorMessage,
      });
    }
  }

  resetForm() {
    this.paciente = {
      nombre: '',
      apellido: '',
      edad: null,
      dni: null,
      obraSocial: '',
      email: '',
      password: ''
    };
    this.selectedPacienteFiles = {};
    this.errorMessage = '';
    this.successMessage = '';
  }
}