import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Especialista } from '../clases/especialista';
import { QueryDocumentSnapshot } from '@angular/fire/compat/firestore';
import { Turno } from '../clases/turno';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  usuario: any; // Definimos la propiedad usuario

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {}

  async getInfoUsuario(): Promise<any> {
    try {
      const user = await this.afAuth.currentUser;
      if (!user) {
        throw new Error('No user is logged in');
      }

      const collections = ['administradores', 'pacientes', 'especialistas'];
      let userData: any = null;

      for (let collection of collections) {
        const userDocRef = this.firestore.collection(collection).doc(user.uid);
        const userDoc = await userDocRef.get().toPromise();

        if (userDoc && userDoc.exists) {
          userData = userDoc.data();
          userData.uid = user.uid; // Incluye el UID en los datos del usuario
          userData.tipo = collection;
          break;
        }
      }

      if (!userData) {
        throw new Error('User document does not exist');
      }

      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  getHistoriaClinica(uid: string): Observable<Turno[]> {
    return this.firestore.collection('historiasClinicas', ref => ref.where('Paciente', '==', uid))
      .valueChanges() as Observable<Turno[]>;
  }

  getUsuario(): any {
    return this.usuario;
  }

  setUsuario(user: any): void {
    this.usuario = user;
  }

  async getUsuarioActual(): Promise<any> {
    return this.afAuth.authState.toPromise();
  }

  async obtenerEspecialistas(): Promise<Especialista[]> {
    try {
      const querySnapshot = await this.firestore
        .collection('especialistas')
        .get()
        .toPromise();

      const especialistas: Especialista[] = [];
      
      if (querySnapshot && !querySnapshot.empty) {
        querySnapshot.forEach((doc: QueryDocumentSnapshot<any>) => {
          const data = doc.data();
          const especialista: Especialista = {
            uid: doc.id,
            especialidad: data.especialidad || '',
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            edad: typeof data.edad === 'number' ? data.edad : 0,
            dni: typeof data.dni === 'number' ? data.dni : 0,
            especialidades: data.especialidades || '',
            imageUrl1: data.imageUrl1 || '',
            verificado: '',
            turnos: []
          };
          especialistas.push(especialista);
        });
      }

      return especialistas;
    } catch (error) {
      console.error('Error fetching specialists:', error);
      throw error;
    }
  }

  async actualizarHorariosEspecialista(uid: string, horarios: any[]): Promise<void> {
    try {
      await this.firestore.collection('especialistas').doc(uid).update({ turnos: horarios });
    } catch (error) {
      console.error('Error updating specialist schedules:', error);
      throw error;
    }
  }

  getUser(): Observable<any> {
    return this.afAuth.authState;
  }
}
