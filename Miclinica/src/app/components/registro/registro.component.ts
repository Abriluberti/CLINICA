import { Component, NgModule } from '@angular/core';
import { FirebaseService } from '../../servicios/firebase.service';
import { LoadingService } from '../../servicios/loading.service'; // Importa el servicio de carga
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [NgIf, FormsModule, AsyncPipe],
  templateUrl: './registro.component.html',
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

  especialista = {
    nombre: '',
    apellido: '',
    edad: null,
    dni: null,
    especialidad: '',
    email: '',
    password: ''
  };

  selectedPacienteFiles: FileList | undefined; // Corregir el nombre de la propiedad
  selectedEspecialistaFile: File | undefined;
  errorMessage: string = '';
  successMessage: string = '';
  loading$ = this.loadingService.loading$;

  constructor(
    private firebaseService: FirebaseService,
    private loadingService: LoadingService // Inyecta el servicio de carga
  ) {}

  onFileSelected(event: any, type: string) {
    const files = event.target.files;
    if (type === 'paciente' && files.length > 1) {
      this.selectedPacienteFiles = files;
    } else if (type === 'especialista' && files.length > 0) {
      this.selectedEspecialistaFile = files[0];
    }
  }

  async registerPatient(event: Event) {
    event.preventDefault();
    if (this.selectedPacienteFiles && this.selectedPacienteFiles.length >= 2) {
      this.loadingService.show(); // Muestra el indicador de carga
      try {
        const file1 = this.selectedPacienteFiles.item(0) as File;
        const file2 = this.selectedPacienteFiles.item(1) as File;
        await this.firebaseService.registerPatient(this.paciente, file1, file2);
        this.successMessage = 'Paciente registrado con éxito';
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: this.successMessage,
        });
        this.resetForm('paciente');
      } catch (error) {
        console.error('Error al registrar paciente:', error);
        this.errorMessage = 'Error al registrar paciente: ' + error;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
        });
      } finally {
        this.loadingService.hide(); // Oculta el indicador de carga
      }
    } else {
      console.error('Error: Se requieren al menos dos imágenes para el perfil del paciente.');
    }
  }

  async registerEspecialista(event: Event) {
    event.preventDefault();
    if (this.selectedEspecialistaFile) {
      this.loadingService.show(); // Muestra el indicador de carga
      try {
        await this.firebaseService.registerEspecialista(this.especialista, this.selectedEspecialistaFile);
        this.successMessage = 'Especialista registrado con éxito';
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: this.successMessage,
        });
        this.resetForm('especialista');
      } catch (error) {
        console.error('Error al registrar especialista:', error);
        this.errorMessage = 'Error al registrar especialista: ' + error;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
        });
      } finally {
        this.loadingService.hide(); // Oculta el indicador de carga
      }
    } else {
      console.error('Error: Se requiere una imagen para el perfil del especialista.');
    }
  }

  resetForm(type: string) {
    if (type === 'paciente') {
      this.paciente = {
        nombre: '',
        apellido: '',
        edad: null,
        dni: null,
        obraSocial: '',
        email: '',
        password: ''
      };
      this.selectedPacienteFiles = undefined;
    } else if (type === 'especialista') {
      this.especialista = {
        nombre: '',
        apellido: '',
        edad: null,
        dni: null,
        especialidad: '',
        email: '',
        password: ''
      };
      this.selectedEspecialistaFile = undefined;
    }
    this.errorMessage = '';
    this.successMessage = '';
  }
}
