import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirebaseService } from '../../servicios/firebase.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  pacientes: any[] = [];
  usuarios: any[] = [];
  especialistas: any[] = [];
  administradores: any[] = [];
  admin = {
    nombre: '',
    apellido: '',
    edad: null,
    dni: null,
    email: '',
    password: '',
    imagen: null
  };
  selectedFile!: File;

  constructor(private firestore: AngularFirestore, private firebaseService: FirebaseService) {}

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

  cargarEspecialistas() {
    this.firestore.collection('especialistas').valueChanges({ idField: 'index' }).subscribe(data => {
      this.especialistas = data;
    });
  }

  cargarAdministradores() {
    this.firestore.collection('administradores').valueChanges({ idField: 'id' }).subscribe(data => {
      this.administradores = data;
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
  

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async registrarAdmin() {
    try {
      await this.firebaseService.registerUser(this.admin, [this.selectedFile], 'administradores');
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'El administrador ha sido registrado con éxito.',
      });
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
}
