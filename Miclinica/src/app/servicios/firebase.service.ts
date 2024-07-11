import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentData, QueryFn, QuerySnapshot } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { HistoriaClinica } from '../clases/historia-clinica';
import { Paciente } from '../clases/paciente';
import { Turno } from '../clases/turno';
import { PacienteData } from '../clases/paciente-data';
import { Especialista } from '../clases/especialista';
import { Admin } from '../clases/admin';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      if (userCredential.user) {
        const userId = userCredential.user.uid;
        const userType = this.getUserType(userId);
        if (userType === 'especialistas') {
          const especialista = await this.getEspecialista(userId);
          if (especialista && especialista.habilitado) {
            console.log('Usuario especialista habilitado, permitiendo acceso...');
          } else {
            console.error('El usuario especialista no está habilitado.');
            throw new Error('El usuario especialista no está habilitado.');
          }
        } else {
          console.log('El usuario no es un especialista, permitiendo acceso...');
        }
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  async getHistoriasClinicasByUsuarioId(usuarioId: string) {
    try {
      const querySnapshot = await this.firestore.collection('historiasClinicas', ref => ref.where('Paciente', '==', usuarioId)).get();
      return querySnapshot;
    } catch (error) {
      console.error('Error al obtener historias clínicas:', error);
      throw error;
    }
  }
  
  async getAllPacientes(): Promise<Paciente[]> {
    try {
      const pacientesSnapshot = await this.firestore.collection<PacienteData>('pacientes').get().toPromise();
      const pacientes: Paciente[] = [];

      pacientesSnapshot?.forEach((doc) => {
        const pacienteData = doc.data() as PacienteData;
        const paciente = new Paciente(
          pacienteData.uid,
          pacienteData.nombre,
          pacienteData.apellido,
          pacienteData.edad,
          pacienteData.dni,
          pacienteData.obraSocial,
          pacienteData.foto1,
          pacienteData.foto2,
          pacienteData.imageUrl1
        );
        pacientes.push(paciente);
      });

      return pacientes;
    } catch (error) {
      console.error('Error al obtener todos los pacientes: ', error);
      return [];
    }
  }

  async obtenerEspecialidades(): Promise<any[]> {
    try {
      const especialidadesSnapshot = await this.firestore.collection<any>('especialidades').get().toPromise();
      const especialidades = especialidadesSnapshot?.docs.map((doc) => {
        return { id: doc.id, ...doc.data() as any };
      }) || [];

      return especialidades;
    } catch (error) {
      console.error('Error al obtener las especialidades: ', error);
      return [];
    }
  }
  async obtenerEspecialistas(): Promise<any[]> {
    try {
      const especialistasSnapshot = await this.firestore.collection<any>('especialistas').get().toPromise();
      const especialistas = especialistasSnapshot?.docs.map((doc) => {
        return { id: doc.id, ...doc.data() as any };
      }) || [];

      return especialistas;
    } catch (error) {
      console.error('Error al obtener los especialistas: ', error);
      return [];
    }
  }
  public async modificarTurno(turno: Turno): Promise<void> {
    const turnoRef = this.firestore.doc(`turnos/${turno.uid}`);
    await turnoRef.update({
      especialidad: turno.idEspecialidad,
      especialista: turno.idEspecialista,
      paciente: turno.pacienteId,
      estado: turno.estado,
      fecha: turno.fecha,
      hora: turno.hora,
      resena: turno.resena,
      comentario: turno.comentario,
      atencion: turno.atencion,
      encuesta: turno.encuesta,
      historiaClinica: turno.historiaClinica,
    });
  }

  async guardarHistoriaClinica(historia: HistoriaClinica): Promise<string | false> {
    try {
      const docRef = await this.firestore.collection('historiasClinicas').add({
        altura: historia.altura,
        peso: historia.peso,
        temperatura: historia.temperatura,
        presion: historia.presion,
        datosDinamicos: historia.datosDinamicos
      });
      console.log('Document written with ID: ', docRef.id);
      return docRef.id;
    } catch (e) {
      console.error('Error adding document: ', e);
      return false;
    }
  }
  
  private getUserType(userId: string): string | null {
    // Aquí puedes implementar la lógica específica de tu aplicación para obtener el tipo de usuario
    return 'especialistas'; // Ejemplo, aquí deberías retornar el tipo de usuario basado en el ID
  }

  private async getEspecialista(userId: string): Promise<any | null> {
    try {
      const especialistaDoc = await this.firestore.collection('especialistas').doc(userId).get().toPromise();
      if (especialistaDoc && especialistaDoc.exists) {
        return especialistaDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos del especialista:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  

  async registerUser(user: any, files: File[], userType: string): Promise<void> {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(user.email, user.password);
      let usuario = userCredential.user;
      if (!userCredential.user) {
        throw new Error('User creation failed');
      }

      const userId = userCredential.user.uid;

      const file1 = files[0];
      const file2 = files[1];

      const filePath1 = `images/${userId}/image1.jpg`;
      const filePath2 = `images/${userId}/image2.jpg`;

      const fileRef1 = this.storage.ref(filePath1);
      const fileRef2 = this.storage.ref(filePath2);

      await this.storage.upload(filePath1, file1).snapshotChanges().pipe(
        finalize(async () => {
          const url1 = await fileRef1.getDownloadURL().toPromise();
          user.imageUrl1 = url1;
        })
      ).toPromise();

      await this.storage.upload(filePath2, file2).snapshotChanges().pipe(
        finalize(async () => {
          const url2 = await fileRef2.getDownloadURL().toPromise();
          user.imageUrl2 = url2;
        })
      ).toPromise();

      await this.firestore.collection(userType).doc(userId).set(user);
if(usuario!= null)
  {
    await usuario.sendEmailVerification();
  }
    } catch (error: any) {
      console.error(`Error al registrar ${userType}:`, error);
    }
  }
  async registerPatient(paciente: any, file1: File, file2: File): Promise<void> {
    try {
      const credential = await this.afAuth.createUserWithEmailAndPassword(paciente.email, paciente.password);
      console.log('Usuario creado correctamente:', credential.user);

      if (credential.user) {
        await credential.user.sendEmailVerification(); // Envía el correo de verificación
        console.log('Correo de verificación enviado correctamente.');

        // Subir imágenes a Firebase Storage y obtener las URLs
        const imageUrl1 = await this.uploadImageAndGetUrl(file1, credential.user.uid);
        const imageUrl2 = await this.uploadImageAndGetUrl(file2, credential.user.uid);

        // Guardar datos del paciente incluyendo las URLs de las imágenes
        const pacienteData = { ...paciente, uid: credential.user.uid, imageUrl1, imageUrl2 };
        delete pacienteData.password; // No almacenar la contraseña en Firestore
        await this.firestore.collection('pacientes').doc(credential.user.uid).set(pacienteData);
        console.log('Datos del paciente almacenados en Firestore.');
      }
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      throw error; // Propaga el error para manejarlo en el componente que llama a esta función
    }
  }
  async registerAdmin(admin: any, file: File): Promise<void> {
    try {
      // Registrar el administrador en Firestore
      const docRef = await this.firestore.collection('administradores').add(admin);

      // Subir la imagen y obtener la URL
      const imageUrl1 = await this.uploadImageAndGetUrl(file, docRef.id);

      // Actualizar el documento del administrador con la URL de la imagen
      await this.firestore.collection('administradores').doc(docRef.id).update({ imageUrl1 });

      console.log('Administrador registrado con ID:', docRef.id);
    } catch (error) {
      console.error('Error al registrar administrador en Firestore:', error);
      throw error;
    }
  }

  private async uploadImageAndGetUrl(file: File, userId: string): Promise<string> {
    const filePath = `images/${userId}/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    try {
      await task;
      const imageUrl = await fileRef.getDownloadURL().toPromise();
      return imageUrl;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  }

  async registerEspecialista(especialista: any, file: File): Promise<void> {
    try {
      // Crear usuario en Firebase Authentication
      const credential = await this.afAuth.createUserWithEmailAndPassword(especialista.email, especialista.password);
      console.log('Usuario creado correctamente:', credential.user);
  
      if (credential.user) {
        // Subir imagen a Firebase Storage y obtener la URL
        const imageUrl = await this.uploadImageAndGetUrl(file, credential.user.uid); // Aquí se corrige el orden de los argumentos
        console.log('Imagen subida correctamente:', imageUrl);
  
        // Actualizar datos del especialista con la URL de la imagen
        const especialistaData = { ...especialista, uid: credential.user.uid, imageUrl1: imageUrl };
        delete especialistaData.password; // No almacenar la contraseña en Firestore
  
        // Guardar datos del especialista en Firestore
        await this.firestore.collection('especialistas').doc(credential.user.uid).set(especialistaData);
        console.log('Datos del especialista almacenados en Firestore.');
  
        // Enviar correo de verificación
        await credential.user.sendEmailVerification();
        console.log('Correo de verificación enviado correctamente.');
      }
    } catch (error) {
      console.error('Error al registrar especialista:', error);
      throw error; // Propaga el error para manejarlo en el componente que llama a esta función
    }
  }
  


  async habilitarUsuario(id: string, habilitado: boolean, userType: string): Promise<void> {
    try {
      const collectionRef = this.firestore.collection(userType);
      await collectionRef.doc(id).update({ habilitado: habilitado });
    } catch (error: any) {
      console.error(`Error al habilitar/deshabilitar usuario ${id} (${userType}):`, error);
      throw error;
    }
  }
  getCurrentUser(): Promise<any> {
    return this.afAuth.currentUser;
  }

  getEspecialistaProfile(uid: string): Observable<any> {
    return this.firestore.collection('especialistas').doc(uid).valueChanges();
  }

  
  obtenerTodosLosTurnos(): Observable<Turno[]> {
    return this.firestore.collection<Turno>('turnos').valueChanges({ idField: 'id' });
  }
/*
  async obtenerTurnosDelUsuario(uid: string, tipo: string): Promise<Turno[]> {
    try {
      let condicion = 'especialista';
      if (tipo === 'paciente') {
        condicion = 'paciente';
      }

      const querySnapshot = await this.firestore.collection('turnos', ref => ref.where(condicion, '==', uid)).get().toPromise();

      if (!querySnapshot) {
        throw new Error('No se obtuvo ningún documento');
      }

      const turnos: Turno[] = [];

      querySnapshot.forEach((doc) => {
        const turnoData = doc.data() as Turno; // Assuming Turno is the correct type here
        const turno = new Turno(
          turnoData.uid,
          turnoData.idEspecialista,
          turnoData.especialidades,
          turnoData.idEspecialidad,
          turnoData.especialistaId,
          turnoData.pacienteId,
          turnoData.especialistaNombre,
          turnoData.estado,
          turnoData.fecha,
          turnoData.hora,
          turnoData.pacienteNombre,
          turnoData.id,
          turnoData.historiaClinica,
          turnoData.encuestaCompleta,
          turnoData.nombreEspecialista,
          turnoData.resena,
          turnoData.encuesta,
          turnoData.calificacion,
          turnoData.comentario, // Pass comentario field from turnoData to Turno constructor
          turnoData.fotoPaciente, // Pass fotoPaciente field from turnoData to Turno constructor
        );
        

        // Optional fields
        if (turnoData.comentario) {
          turno.comentario = turnoData.comentario;
        }
        if (turnoData.resena) {
          turno.resena = turnoData.resena;
        }
        if (turnoData.historiaClinica) {
          turno.historiaClinica = turnoData.historiaClinica;
        }
        if (turnoData.encuesta) {
          turno.encuesta = turnoData.encuesta;
        }
        if (turnoData.atencion) {
          turno.atencion = turnoData.atencion;
        }

        turnos.push(turno);
      });

      return turnos;
    } catch (error) {
      console.error(`Error al obtener los turnos del ${tipo} con UID ${uid}: `, error);
      return []; // Return an empty array or handle the error accordingly
    }
  }


  async getUserByUidAndType(uid: string, type: string): Promise<any> {
    try {
      const querySnapshot = await this.firestore.collection(type, ref => ref.where('uid', '==', uid)).get().toPromise();
  
      if (!querySnapshot || querySnapshot.size === 0) {
        console.log(`No se encontró ningún ${type} con el UID proporcionado`);
        return null;
      }
  
      const userData = querySnapshot.docs[0].data() as {
        uid: string,
        nombre: string,
        apellido: string,
        edad: number,
        dni: string,
        obraSocial?: string,
        foto1?: any,
        foto2?: any,
        especialidades?: string[],
        verificado?: string,
        turnos?: any[]
      };
  
      let user = null;
  
      switch (type) {
        case 'admins':
          user = new Admin(
            userData.uid,
            userData.nombre,
            userData.apellido,
            userData.edad,
            userData.dni,
            userData.foto1
          );
          break;
        case 'pacientes':
          user = new Paciente(
            userData.uid,
            userData.nombre,
            userData.apellido,
            userData.edad,
            userData.dni,
            userData.obraSocial,
            userData.foto1,
            userData.foto2
          );
          break;
        case 'especialistas':
          user = new Especialista(
            userData.uid,
            userData.nombre,
            userData.apellido,
            userData.edad,
            userData.dni,
            userData.especialidades || [],
            userData.foto1 || '',
            userData.verificado || ''
          );
          user.turnos = userData.turnos || [];
          break;
      }
  
      return user;
    } catch (error) {
      console.error(`Error al buscar el ${type} por UID: `, error);
      return null;
    }
  }
  */
  
  obtenerHorarios() {
    return this.firestore.collection('horarios').valueChanges({ idField: 'id' });
  }

  getTurnosPorMedicoEnRango(fechaInicio: Date, fechaFin: Date): Observable<any[]> {
    // Verifica y convierte las fechas a tipo Date si es necesario
    if (!(fechaInicio instanceof Date)) {
      fechaInicio = new Date(fechaInicio);
    }
    if (!(fechaFin instanceof Date)) {
      fechaFin = new Date(fechaFin);
    }

    // Ahora puedes usar toISOString() después de asegurar que son objetos Date válidos
    const fechaInicioISO = fechaInicio.toISOString();
    const fechaFinISO = fechaFin.toISOString();

    // Ejemplo de consulta a Firestore usando las fechas convertidas
    return this.firestore.collection<any>('turnos', ref =>
      ref.where('fecha', '>=', fechaInicioISO)
         .where('fecha', '<=', fechaFinISO)
    ).valueChanges();
  }

  guardarHorario(horario: any): Promise<any> {
    return this.firestore.collection('horarios').add(horario);
  }
  // Método para obtener turnos desde Firestore
  obtenerTurnos(): Observable<any[]> {
    return this.firestore.collection('turnos').valueChanges({ idField: 'id' }); // Ajusta según la estructura de tu colección
  }
  obtenerHorariosPorEspecialista(especialistaId: string): Observable<any[]> {
    return this.firestore.collection('horarios', ref => ref.where('especialistaId', '==', especialistaId)).valueChanges({ idField: 'id' });
  }

  guardarHorariosPorEspecialista(especialistaId: string, horarios: any[]): Promise<void> {
    const batch = this.firestore.firestore.batch();
    const horariosRef = this.firestore.collection('horarios');

    horarios.forEach(horario => {
      const docRef = horariosRef.doc(horario.id).ref;
      batch.set(docRef, { ...horario, especialistaId });
    });

    return batch.commit();
  }
  async getDaysToLog(): Promise<string[]> {
    try {
      const snapshot = await this.firestore.collection('logEntries').get().toPromise();
      if (snapshot && !snapshot.empty) { // Verifica que snapshot no sea undefined y que no esté vacío
        return snapshot.docs.map(doc => {
          const data = doc.data() as { day: string }; // Especifica el tipo de datos esperado
          return data.day;
        });
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error getting days to log', error);
      return [];
    }
  }


  
  async getCountsToLog(): Promise<number[]> {
    try {
      const snapshot = await this.firestore.collection('logEntries').get().toPromise();
      if (snapshot && !snapshot.empty) { // Verifica que snapshot no sea undefined y que no esté vacío
        return snapshot.docs.map(doc => {
          const data = doc.data() as { count: number }; // Especifica el tipo de datos esperado
          return data.count;
        });
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error getting counts to log', error);
      return [];
    }
  }

  async getLogs(fecha: string): Promise<any[]> {
    try {
      const snapshot = await this.firestore.collection('logEntries', ref => ref.where('date', '==', fecha)).get().toPromise();
      if (snapshot && !snapshot.empty) {
        return snapshot.docs.map(doc => doc.data());
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error getting logs for date', fecha, error);
      return [];
    }
  }
 
  async getAllLogs(): Promise<any[]> {
    try {
      const snapshot = await this.firestore.collection('logEntries').get().toPromise();
      if (snapshot && !snapshot.empty) { // Verifica que snapshot no sea undefined y que no esté vacío
        return snapshot.docs.map(doc => doc.data()); // Devuelve los datos de cada documento
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error getting log entries:', error);
      return [];
    }
  }
  getLogIngresos(): Observable<any[]> {
    return this.firestore.collection('logEntries', ref =>
      ref.orderBy('fecha', 'desc')
    ).valueChanges();
  }
  getLogEntries(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.firestore.collection('logEntries').valueChanges().subscribe((logs: any[]) => {
        resolve(logs);
      }, error => {
        reject(error);
      });
    });
  }

  getTurnosFinalizadosPorEspecialistaEnRango(inicio: Date, fin: Date): Observable<any[]> {
    return this.firestore.collection('turnos', ref =>
      ref.where('fecha', '>=', inicio).where('fecha', '<=', fin).where('estado', '==', 'Realizado')
    ).valueChanges();
  }
  getTurnosPorEspecialistaEnRango(inicio: Date, fin: Date, buscarRealizados: boolean, mostrarRealizados: boolean): Observable<any[]> {
    let query: AngularFirestoreCollection<any>; // Especifica el tipo de AngularFirestoreCollection

    // Construcción de la consulta Firestore
    if (buscarRealizados && mostrarRealizados) {
      query = this.firestore.collection<any>('turnos', ref =>
        ref.where('fecha', '>=', inicio)
           .where('fecha', '<=', fin)
           .where('estado', '==', 'realizado')
      );
    } else if (buscarRealizados && !mostrarRealizados) {
      query = this.firestore.collection<any>('turnos', ref =>
        ref.where('fecha', '>=', inicio)
           .where('fecha', '<=', fin)
           .where('estado', '==', 'realizado')
      );
    } else if (!buscarRealizados && mostrarRealizados) {
      query = this.firestore.collection<any>('turnos', ref =>
        ref.where('fecha', '>=', inicio)
           .where('fecha', '<=', fin)
           .where('estado', '==', 'no realizado')
      );
    } else {
      query = this.firestore.collection<any>('turnos', ref =>
        ref.where('fecha', '>=', inicio)
           .where('fecha', '<=', fin)
      );
    }

    return query.valueChanges();
  }

  getTurnosPorMedicoEnLapsoDeTiempo(inicio: Date, fin: Date): Observable<any[]> {
    return this.firestore.collection('turnos', ref => 
      ref.where('fecha', '>=', inicio).where('fecha', '<=', fin)
    ).valueChanges();
  }
  getTurnos(): Observable<any[]> {
    return this.firestore.collection('turnos').valueChanges();
  }
  getTurnosToChart(): Observable<any> {
    return this.firestore.collection('turnos').snapshotChanges();
  }
    getTurnosPorEspecialidad(): Observable<any> {
    return this.firestore.collection('turnos').valueChanges().pipe(
      map((turnos: any[]) => {
        const countByEspecialidad: any = {};

        turnos.forEach(turno => {
          if (turno.especialidades && turno.especialidades.length > 0) {
            turno.especialidades.forEach((especialidad: string) => {
              if (countByEspecialidad[especialidad]) {
                countByEspecialidad[especialidad]++;
              } else {
                countByEspecialidad[especialidad] = 1;
              }
            });
          }
        });

        return countByEspecialidad;
      })
    );
  }
  async getLogsForMonth(formattedMonth: string): Promise<any[]> {
    try {
      const snapshot = await this.firestore.collection<any>('logEntries', ref => ref.where('month', '==', formattedMonth)).get().toPromise();
      
      if (snapshot) {
        return snapshot.docs.map(doc => doc.data());
      } else {
        console.error('No se recibió un snapshot de Firestore para el mes', formattedMonth);
        return []; // Retorna un array vacío o maneja el error según tus requerimientos
      }
    } catch (error) {
      console.error('Error obteniendo registros para el mes', formattedMonth, error);
      throw error; // O maneja el error de otra manera según tus necesidades
    }
  }
  
  
  async downloadFile(filename: string): Promise<string> {
    try {
      const url = await this.storage.ref(filename).getDownloadURL().toPromise();
      return url;
    } catch (error) {
      console.error('Error downloading file', error);
      return '';
    }
  }
  async updateEspecialistaHorarios(uid: string, horarios: any): Promise<void> {
    try {
      await this.firestore.collection('especialistas').doc(uid).update({ horarios: horarios });
    } catch (error: any) {
      console.error('Error al actualizar los horarios:', error);
      throw error;
    }
  }
}


 
