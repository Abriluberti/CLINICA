import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';
import { FirebaseService } from '../../servicios/firebase.service';

@Component({
  selector: 'app-especialistas',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './especialistas.component.html',
  styleUrl: './especialistas.component.css'
})
export class EspecialistasComponent {

  especialistas: any[] = [];

  constructor(private firestore: AngularFirestore, private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.cargarEspecialistas();
  }

  cargarEspecialistas() {
    this.firestore.collection('especialistas').valueChanges({ idField: 'id' }).subscribe(data => {
      this.especialistas = data;
    });
  }

  habilitarUsuario(id: string, habilitado: boolean) {
    this.firestore.collection('especialistas').doc(id).update({ habilitado: habilitado }).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: `El especialista ha sido ${habilitado ? 'habilitado' : 'deshabilitado'}.`,
      });
    }).catch(error => {
      console.error('Error al actualizar el especialista:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar el especialista.',
      });
    });
  }
}