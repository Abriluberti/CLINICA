import { Injectable } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/compat/firestore';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Turno } from '../clases/turno';
import { HistoriaClinica } from '../clases/historia-clinica';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) {}


  async cancelarTurno(turnoId: string, comentario: string): Promise<void> {
    try {
      await this.firestore.collection('turnos').doc(turnoId).update({
        estado: 'Cancelado',
        comentarioCancelacion: comentario
      });
      console.log(`Turno con ID ${turnoId} cancelado exitosamente.`);
    } catch (error) {
      console.error(`Error al cancelar el turno con ID ${turnoId}:`, error);
      throw error;
    }
  }

  cancelarrTurno(turnoId: string, comentario: string): Promise<void> {
    return this.firestore.collection('turnos').doc(turnoId).update({
      estado: 'Cancelado',
      comentarioCancelacion: comentario
    });
  }
  async rechazarTurno(turnoId: string, comentario: string): Promise<void> {
    try {
      await this.firestore.collection('turnos').doc(turnoId).update({
        estado: 'Rechazado',
        comentarioRechazo: comentario
      });
      console.log(`Turno con ID ${turnoId} rechazado exitosamente.`);
    } catch (error) {
      console.error(`Error al rechazar el turno con ID ${turnoId}:`, error);
      throw error;
    }
  }
  getEspecialistasFromTurnos(): Observable<string[]> {
    return this.firestore.collection<Turno>('turnos').valueChanges().pipe(
      map(turnos => {
        const especialistas: string[] = [];
        turnos.forEach(turno => {
          if (turno.especialistaNombre && !especialistas.includes(turno.especialistaNombre)) {
            especialistas.push(turno.especialistaNombre);
          }
        });
        return especialistas;
      })
    );
  }

  async aceptarTurno(turnoId: string): Promise<void> {
    try {
      await this.firestore.collection('turnos').doc(turnoId).update({
        estado: 'Aceptado'
      });
      console.log(`Turno con ID ${turnoId} aceptado exitosamente.`);
    } catch (error) {
      console.error(`Error al aceptar el turno con ID ${turnoId}:`, error);
      throw error;
    }
  }

  async finalizarTurno(turnoId: string, resena: string): Promise<void> {
    try {
      await this.firestore.collection('turnos').doc(turnoId).update({
        estado: 'Realizado',
        resena: resena
      });
      console.log(`Turno con ID ${turnoId} realizado exitosamente.`);
    } catch (error) {
      console.error(`Error al finalizar el turno con ID ${turnoId}:`, error);
      throw error;
    }
  }

  obtenerTurnoPorId(turnoId: string): Observable<Turno | undefined> {
    return this.firestore.collection('turnos').doc(turnoId).valueChanges().pipe(
      map((turno: any) => {
        if (turno) {
          return {
            id: turnoId,
            ...turno
          } as Turno;
        } else {
          return undefined;
        }
      })
    );
  }

  // Obtener los turnos de un paciente y agregar el nombre del especialista
  getTurnosPaciente(uidPaciente: string): Observable<any[]> {
    return this.firestore.collection('turnos', ref => ref.where('pacienteId', '==', uidPaciente)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        const turno = { id, ...data };

        // Obtener nombre del especialista de forma asíncrona
        this.getNombreEspecialista(turno.especialistaId).subscribe(nombre => {
          turno.especialistaNombre = nombre;
        });

        return turno;
      }))
    );
  }


  buscarPorPacienteNombre(pacienteNombre: string, especialistaId: string): Observable<Turno[]> {
    return this.firestore.collection<Turno>('turnos', ref =>
      ref.where('pacienteNombre', '==', pacienteNombre.trim()).where('especialistaId', '==', especialistaId)
    ).valueChanges();
  }
  
  // Obtener el nombre del especialista por su ID
  getNombreEspecialista(especialistaId: string): Observable<string> {
    return this.firestore.collection('especialistas').doc(especialistaId).valueChanges().pipe(
      map((especialista: any) => especialista.nombre)
    );
  }

  // Obtener todos los turnos (sin filtro específico)
  getTurnos(): Observable<any[]> {
    return this.firestore.collection('turnos').valueChanges();
  }

  // Obtener los turnos de un especialista por su ID
  getTurnosEspecialista(especialistaId: string): Observable<any[]> {
    return this.firestore.collection('turnos', ref => ref.where('especialistaId', '==', especialistaId)).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }
  buscarTurnos(filtro: string, tipoFiltro: 'especialidad' | 'paciente', especialistaId: string): Observable<any[]> {
    const filtroTrimmed = filtro.trim();
  
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          let queryFn: QueryFn = ref => {
            let queryRef = ref as any;
  
            if (especialistaId) {
              queryRef = queryRef.where('especialistaId', '==', especialistaId);
            }
  
            if (tipoFiltro === 'especialidad' && filtroTrimmed !== '') {
              queryRef = queryRef.where('especialidades', 'array-contains', filtroTrimmed);
            } else if (tipoFiltro === 'paciente' && filtroTrimmed !== '') {
              queryRef = queryRef.where('pacienteNombre', '==', filtroTrimmed);
            }
  
            return queryRef;
          };
  
          return this.firestore.collection('turnos', queryFn).snapshotChanges().pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data() as any;
                const id = a.payload.doc.id;
                return { ...data, id };
              });
            }),
            catchError(error => {
              console.error('Error al buscar turnos:', error);
              return of([]);
            })
          );
        } else {
          return of([]);
        }
      }),
      catchError(error => {
        console.error('Error al autenticar:', error);
        return of([]);
      })
    );
  }

  getTurnoById(turnoId: string): Observable<any> {
    return this.firestore.collection('turnos').doc(turnoId).valueChanges().pipe(
      map((turno: any) => ({ id: turnoId, ...turno }))
    );
  }

  completarEncuesta(turnoId: string, encuestaData: any): Promise<void> {
    if (!turnoId) {
      return Promise.reject("ID de turno no proporcionado");
    }
    return this.firestore.collection('turnos').doc(turnoId).update({
      encuesta: encuestaData
    });
  }
  

  crearHistoriaClinica(turnoId: string, historiaClinica: HistoriaClinica): Observable<void> {
    const turnoRef = this.firestore.collection('turnos').doc(turnoId);
    return new Observable<void>((observer) => {
      turnoRef.update({ historiaClinica })
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
  getTurnosPorEspecialista(especialistaId: string): Observable<Turno[]> {
    return this.firestore.collection<Turno>('turnos', ref => ref.where('especialistaId', '==', especialistaId))
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Turno;
          data.id = a.payload.doc.id;
          return data;
        }))
      );
  }
  calificarTurno(calificacion: number, comentario: string): Promise<void> {
    const calificacionData = {
      calificacion: calificacion,
      comentario: comentario,
      fecha: new Date()
    };

    return this.firestore.collection('calificaciones').add(calificacionData).then(() => {
      return;
    });
  }

  obtenerEncuesta(turnoId: string): Observable<any> {
    return this.firestore.collection('encuestas').doc(turnoId).valueChanges();
  }


  calificarAtencion(turnoId: string, calificacionData: any): Promise<void> {
    return this.firestore.collection('turnos').doc(turnoId).update({ calificacion: calificacionData });
  }

 
  actualizarHistoriaClinica(turnoId: string, altura: number, peso: number, temperatura: number, presion: string): Observable<any> {
    if (!turnoId) {
      console.error('El ID del turno está vacío o es undefined.');
      return throwError('El ID del turno no es válido.');
    }
  
    const historiaClinica = {
      altura,
      peso,
      temperatura,
      presion
    };
  
    return from(this.firestore.collection('historiasClinicas').doc(turnoId).update(historiaClinica));
  }
  

  // Método para obtener historias clínicas de un paciente específico
  obtenerHistoriasClinicasPorPaciente(pacienteId: string): Observable<any[]> {
    return this.firestore.collection('historiasClinicas', ref => ref.where('pacienteId', '==', pacienteId))
      .snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        }),
        catchError(error => {
          console.error('Error al obtener historias clínicas:', error);
          return of([]);
        })
      );
  }

  buscarTurnosPacientes(filtroBusquedaPaciente: string, especialistaId: string): Observable<any[]> {
    const filtroDos = filtroBusquedaPaciente.trim();
  
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          let queryFn: QueryFn = ref => {
            let queryRef = ref as any;
  
            if (especialistaId) {
              queryRef = queryRef.where('especialistaId', '==', especialistaId);
            }
  
            if (filtroDos !== '') {
              queryRef = queryRef.where('pacienteNombre', '==', filtroDos);
            }
  
            return queryRef;
          };
  
          return this.firestore.collection('turnos', queryFn).snapshotChanges().pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data() as any;
                const id = a.payload.doc.id;
                return { ...data, id };
              });
            }),
            catchError(error => {
              console.error('Error al buscar turnos de pacientes:', error);
              return of([]);
            })
          );
        } else {
          return of([]);
        }
      }),
      catchError(error => {
        console.error('Error al autenticar:', error);
        return of([]);
      })
    );
  }
  // Solicitar un turno nuevo
  async solicitarTurno(turno: any, pacienteNombre: string): Promise<void> {
    const nombreEspecialista = await this.getNombreEspecialista(turno.especialistaId).toPromise();
    const turnoData = {
      ...turno,
      pacienteNombre: pacienteNombre,
      especialistaNombre: nombreEspecialista // Agregar el nombre del especialista
    };
    await this.firestore.collection('turnos').add(turnoData);
  }
  

}
