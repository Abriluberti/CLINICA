import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from '../../servicios/firebase.service';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, CommonModule, RecaptchaModule, RecaptchaFormsModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  pacientes: any[] = [];
  especialistas: any[] = [];
  administradores: any[] = [];
  admin = {
    nombre: '',
    apellido: '',
    edad: null,
    dni: null,
    email: '',
    password: '',
    imageUrl1: ''
  };
  selectedFile!: File;
  captchaError: boolean = false;
  captchaResolved: boolean = false;
  successMessage: string = '';
  registerForm!: FormGroup;
  errorMessage: string = '';

  constructor(private firestore: AngularFirestore, private firebaseService: FirebaseService) {
    this.registerForm = new FormGroup({
      nombre: new FormControl('', Validators.required),
      apellido: new FormControl('', Validators.required),
      edad: new FormControl(null, [Validators.required, Validators.min(0)]),
      dni: new FormControl(null, Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      recaptcha: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    this.cargarPacientes();
    this.cargarEspecialistas();
    this.cargarAdministradores();
  }

  cargarPacientes() {
    this.firestore.collection('pacientes').valueChanges({ idField: 'index' }).subscribe(data => {
      this.pacientes = data;
    });
  }

  onCaptchaResolved(captchaResponse: string) {
    this.registerForm.patchValue({ recaptcha: captchaResponse });
    this.captchaError = false;
    this.captchaResolved = true; // Marca el reCAPTCHA como completado correctamente
  }

  cargarEspecialistas() {
    this.firestore.collection('especialistas').valueChanges({ idField: 'index' }).subscribe(data => {
      this.especialistas = data;
    });
  }

  habilitarUsuario(id: string, habilitado: boolean, tipo: string) {
    let collection = tipo === 'paciente' ? 'pacientes' : tipo === 'especialista' ? 'especialistas' : 'administradores';
    this.firestore.collection(collection).doc(id).update({ habilitado: habilitado }).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: `El usuario ha sido ${habilitado ? 'habilitado' : 'inhabilitado'}.`,
      });
    }).catch(error => {
      console.error('Error al actualizar el usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar el usuario.',
      });
    });
  }

  async registrarAdmin() {
    if (!this.captchaResolved) {
      this.errorMessage = 'Debe completar el reCAPTCHA para registrar al especialista.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.errorMessage,
      });
      return; // Evita seguir con el registro si no se completó el reCAPTCHA
    }

    try {
      if (!this.selectedFile) {
        throw new Error('No se ha seleccionado ningún archivo.');
      }

      // Registrar el administrador
      await this.firebaseService.registerAdmin(this.admin, this.selectedFile);

      // Mostrar mensaje de éxito y recargar la lista de administradores
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'El administrador ha sido registrado con éxito.',
      });

      // Vaciar los campos del formulario y reiniciar valores
      this.admin = {
        nombre: '',
        apellido: '',
        edad: null,
        dni: null,
        email: '',
        password: '',
        imageUrl1: ''
      };
      this.registerForm.reset(); // Esto limpia los valores del formulario

      

      // Recargar la lista de administradores
      this.cargarAdministradores();
    } catch (error) {
      console.error('Error al registrar administrador:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al registrar el administrador.',
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  cargarAdministradores() {
    this.firestore.collection('administradores').valueChanges({ idField: 'id' }).subscribe(data => {
      this.administradores = data;
    });
  }

  // Otros métodos como cargarPacientes(), cargarEspecialistas(), habilitarUsuario(), etc.
}