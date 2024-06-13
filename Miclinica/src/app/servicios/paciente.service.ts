import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  constructor(private firestore: AngularFirestore) { }

  buscarPacientePorNombreYApellido(nombre: string, apellido: string): Observable<any> {
    return this.firestore.collection('pacientes', ref => 
        ref.where('nombre', '==', nombre)
           .where('apellido', '==', apellido)
        ).valueChanges({ idField: 'uid' });
  }
}
