import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HistoriaClinica } from '../clases/historia-clinica';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaService {

  constructor(private firestore: AngularFirestore) { }
  getHistoriaClinicaPorPaciente(pacienteId: string): Observable<HistoriaClinica | undefined> {
    return this.firestore.collection<HistoriaClinica>('historiasClinicas', ref => ref.where('Paciente', '==', pacienteId))
      .valueChanges({ idField: 'id' })
      .pipe(
        map(historiaClinicas => {
          console.log('Historias clínicas encontradas:', historiaClinicas);
          return historiaClinicas[0];
        }),
        catchError(error => {
          console.error('Error obteniendo historia clínica:', error);
          return of(undefined);
        })
      );
  }
  
  
  
}
