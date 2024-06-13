import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  getUsers() {
    throw new Error('Method not implemented.');
  }
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) { }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      if (userCredential.user) {
        const userId = userCredential.user.uid;
        const userType = this.getUserType(userId);
        if (userType === 'especialistas') {
          const especialista = await this.getEspecialista(userId);
          if (especialista && especialista.habilitado) {
            // Usuario especialista habilitado, permitir el acceso
            console.log('Usuario especialista habilitado, permitiendo acceso...');
          } else {
            // Usuario especialista no habilitado, denegar el acceso
            console.error('El usuario especialista no está habilitado.');
            throw new Error('El usuario especialista no está habilitado.');
          }
        } else {
          // El usuario no es un especialista, permitir el acceso
          console.log('El usuario no es un especialista, permitiendo acceso...');
        }
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  private getUserType(userId: string): string | null {
    // Lógica para determinar el tipo de usuario (administrador, paciente, especialista, etc.)
    // Aquí puedes implementar la lógica específica de tu aplicación
    // En este ejemplo, se asume que se almacena el tipo de usuario en un campo 'perfil' en la colección correspondiente
    // Puedes adaptar esta lógica según la estructura de tu base de datos
    return 'especialistas'; // Ejemplo, aquí deberías retornar el tipo de usuario basado en el ID
  }

// Método para obtener los datos del especialista basado en su ID
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
  
  getCurrentUser(): Promise<any> {
    return this.afAuth.currentUser;
  }
  async registerUser(user: any, files: File[], userType: string): Promise<void> {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(user.email, user.password);
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

    } catch (error: any) {
      console.error(`Error al registrar ${userType}:`, error);
    }
  }

  registerPatient(paciente: any, file1: File, file2: File): Promise<void> {
    return this.registerUser(paciente, [file1, file2], 'pacientes');
  }
  
  getAdministrators() {
    return this.firestore.collection('administradores').valueChanges({ idField: 'id' });
  }

  registerEspecialista(especialista: any, file: File): Promise<void> {
    return this.registerUser(especialista, [file], 'especialistas');
}
async habilitarUsuario(id: string, habilitado: boolean, userType: string): Promise<void> {
  try {
    const collectionRef = this.firestore.collection(userType);
    await collectionRef.doc(id).update({ habilitado: habilitado });
  } catch (error: any) {
    console.error(`Error al habilitar/deshabilitar usuario ${id} (${userType}):`, error);
    throw error; // Puedes manejar el error según tus necesidades
  }
}
}