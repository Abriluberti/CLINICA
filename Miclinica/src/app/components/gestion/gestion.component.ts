import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';
import { FirebaseService } from '../../servicios/firebase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']  // Corregido a styleUrls
})
export class GestionComponent implements OnInit {
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
    imagen: null,
    perfil: '' // Agregamos un campo para almacenar el perfil del usuario
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
      this.pacientes = data.map(paciente => ({...paciente, perfil: 'paciente'})); // Agregamos el perfil 'paciente' a cada paciente
    });
  }

  cargarEspecialistas() {
    this.firestore.collection('especialistas').valueChanges({ idField: 'index' }).subscribe(data => {
      this.especialistas = data.map(especialista => ({...especialista, perfil: 'especialista'})); // Agregamos el perfil 'especialista' a cada especialista
    });
  }

  cargarAdministradores() {
    this.firestore.collection('administradores').valueChanges({ idField: 'index' }).subscribe(data => {
      this.administradores = data.map(administrador => ({...administrador, perfil: 'administrador'})); // Agregamos el perfil 'administrador' a cada administrador
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
}