import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoadingService } from '../../servicios/loading.service';
import { FirebaseService } from '../../servicios/firebase.service';
import Swal from 'sweetalert2';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-registro-especialista',
  standalone: true,
  imports: [NgIf, FormsModule, AsyncPipe, NgFor, RecaptchaModule, RecaptchaFormsModule, ReactiveFormsModule],
  templateUrl: './registro-especialista.component.html',
  styleUrls: ['./registro-especialista.component.css']
})
export class RegistroEspecialistaComponent {
  especialista = {
    nombre: '',
    apellido: '',
    edad: null,
    dni: null,
    especialidades: [] as string[],
    email: '',
    password: ''
  };

  especialidades: string[] = ['Cardiología', 'Neurología', 'Pediatría',  'Dentista'];
  especialidadSeleccionada: string = '';
  nuevaEspecialidad: string = '';
  captchaError: boolean = false;
  mostrarCampoOtraEspecialidad: boolean = false;
  selectedEspecialistaFile: File | undefined;
  errorMessage: string = '';
  successMessage: string = '';
  loading$ = this.loadingService.loading$;
  captchaResolved: boolean = false;
  registerForm: FormGroup;

  constructor(
    private firebaseService: FirebaseService,
    private loadingService: LoadingService
  ) {
    this.registerForm = new FormGroup({
      nombre: new FormControl(this.especialista.nombre, Validators.required),
      apellido: new FormControl(this.especialista.apellido, Validators.required),
      edad: new FormControl(this.especialista.edad, [Validators.required, Validators.min(0)]),
      dni: new FormControl(this.especialista.dni, Validators.required),
      especialidadSeleccionada: new FormControl('', Validators.required),
      email: new FormControl(this.especialista.email, [Validators.required, Validators.email]),
      password: new FormControl(this.especialista.password, Validators.required),
      recaptcha: new FormControl('', Validators.required)
    });
  }

  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (type === 'especialista' && file) {
      this.selectedEspecialistaFile = file;
    }
  }
  onCaptchaResolved(captchaResponse: string) {
    this.registerForm.patchValue({ recaptcha: captchaResponse });
    this.captchaError = false;
    this.captchaResolved = true; // Marca el reCAPTCHA como completado correctamente
  }
  agregarEspecialidad() {
    if (this.especialidadSeleccionada === 'otra') {
      this.mostrarCampoOtraEspecialidad = true;
    } else if (this.especialidadSeleccionada && !this.especialista.especialidades.includes(this.especialidadSeleccionada)) {
      this.especialista.especialidades.push(this.especialidadSeleccionada);
    }
    this.especialidadSeleccionada = '';
  }
  agregarNuevaEspecialidad() {
    if (this.nuevaEspecialidad && !this.especialidades.includes(this.nuevaEspecialidad)) {
      this.especialidades.push(this.nuevaEspecialidad);
    }
    if (this.nuevaEspecialidad && !this.especialista.especialidades.includes(this.nuevaEspecialidad)) {
      this.especialista.especialidades.push(this.nuevaEspecialidad);
      this.mostrarCampoOtraEspecialidad = false;
      this.nuevaEspecialidad = '';
    }
  }

  async registerEspecialista(event: Event) {
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

    if (this.selectedEspecialistaFile) {
      this.loadingService.show();
      try {
        await this.firebaseService.registerEspecialista(this.especialista, this.selectedEspecialistaFile);
        this.successMessage = 'Especialista registrado con éxito. Por favor, verifica tu correo electrónico.';
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: this.successMessage,
        });
        this.resetForm();
      } catch (error) {
        console.error('Error al registrar especialista:', error);
        this.errorMessage = 'Error al registrar especialista: ' + error;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
        });
      } finally {
        this.loadingService.hide();
      }
    } else {
      this.errorMessage = 'Se requiere una imagen para el perfil del especialista.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.errorMessage,
      });
    }
  }

  resetForm() {
    this.especialista = {
      nombre: '',
      apellido: '',
      edad: null,
      dni: null,
      especialidades: [],
      email: '',
      password: ''
    };
    this.selectedEspecialistaFile = undefined;
    this.errorMessage = '';
    this.successMessage = '';
    this.registerForm.reset();
    this.captchaResolved = false; // Reinicia el estado del reCAPTCHA
  }
}