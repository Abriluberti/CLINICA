import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Paciente } from '../clases/paciente';
import { Turno } from '../clases/turno';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  constructor(private firestore: AngularFirestore) { }

  // Obtener el UID del paciente por su nombre
  obtenerUidPacientePorNombre(nombrePaciente: string): Observable<string | null> {
    return this.firestore.collection('pacientes', ref => ref.where('nombre', '==', nombrePaciente))
      .get()
      .pipe(
        map(querySnapshot => {
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return doc.id; // Devolver el UID del primer paciente encontrado
          } else {
            return null; // Devolver null si no se encontró ningún paciente con ese nombre
          }
        })
      );
  }
  getPaciente(uid: string): Observable<Paciente | undefined> {
    return this.firestore.collection<Paciente>('pacientes').doc(uid).snapshotChanges().pipe(
      map(doc => {
        if (doc.payload.exists) {
          const data = doc.payload.data() as Paciente;
          const id = doc.payload.id;
          return { id, ...data };
        } else {
          return undefined;
        }
      })
    );
  }
  getPacientesAtendidosPorEspecialista(especialistaId: string): Observable<any[]> {
    return this.firestore.collection<Turno>('turnos', ref =>
      ref.where('especialistaId', '==', especialistaId)
         .where('estado', '==', 'Realizado')
    ).valueChanges();
  }
  private createEmptyPaciente(uid: string): Paciente {
    return {
      uid: uid,
      nombre: '',
      apellido: '',
      edad: 0,
      dni: 0,
      obraSocial: '',
      imageUrl1: '',
      foto1: '',
      foto2: '',
      historiaClinica: undefined
    };
  }
  
  // Obtener el nombre del paciente por su UID
  obtenerNombrePaciente(uidPaciente: string): Observable<string | null> {
    return this.firestore.collection('pacientes').doc(uidPaciente).valueChanges()
      .pipe(
        map((paciente: any) => {
          if (paciente) {
            return paciente.nombre; // Devolver el nombre del paciente
          } else {
            return null; // Manejar el caso donde no se encontró el paciente
          }
        })
      );
  }

  // Ejemplo: Método para agregar un nuevo paciente
  agregarPaciente(uid: string, paciente: any): Promise<void> {
    const pacienteRef = this.firestore.collection('pacientes').doc(uid);
    return pacienteRef.set({ ...paciente });
  }

  // Otros métodos según sea necesario (actualizar, eliminar, etc.)

}
