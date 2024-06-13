import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  constructor(private firestore: AngularFirestore) {}

  getTurnosPaciente(uidPaciente: string): Observable<any[]> {
    return this.firestore.collection('turnos', ref => ref.where('pacienteId', '==', uidPaciente)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

    getTurnos(): Observable<any[]> {
    return this.firestore.collection('turnos').valueChanges();
  }

  getTurnosEspecialista(especialistaId: string): Observable<any[]> {
    return this.firestore.collection('turnos', ref => ref.where('especialistaId', '==', especialistaId)).valueChanges();
  }

  getTurnosAdmin(): Observable<any[]> {
    return this.firestore.collection('turnos').valueChanges();
  }

  buscarTurnos(especialidad: string, especialista: string): Observable<any[]> {
    let query = this.firestore.collection('turnos') as any;

    if (especialidad) {
      query = query.where('especialidadId', '==', especialidad);
    }

    if (especialista) {
      query = query.where('especialistaId', '==', especialista);
    }

    return query.valueChanges();
  }

  cancelarTurno(turnoId: string, comentario: string): Promise<void> {
    return this.firestore.collection('turnos').doc(turnoId).update({ estado: 'Cancelado', comentarioCancelacion: comentario });
  }

  rechazarTurno(turnoId: string, comentario: string): Promise<void> {
    return this.firestore.collection('turnos').doc(turnoId).update({ estado: 'Rechazado', comentarioRechazo: comentario });
  }

  aceptarTurno(turnoId: string): Promise<void> {
    return this.firestore.collection('turnos').doc(turnoId).update({ estado: 'Aceptado' });
  }

  finalizarTurno(turnoId: string, comentario: string): Promise<void> {
    return this.firestore.collection('turnos').doc(turnoId).update({ estado: 'Realizado', resena: comentario });
  }
}
