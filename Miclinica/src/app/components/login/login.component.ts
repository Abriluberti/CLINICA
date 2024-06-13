import { NgIf, AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';
import { FirebaseService } from '../../servicios/firebase.service';
import { LoadingService } from '../../servicios/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RouterOutlet, NgIf, AsyncPipe, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading$ = this.loadingService.loading$;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore,
    private firebaseService: FirebaseService,
    private loadingService: LoadingService
  ) {}

  async login() {
    this.loadingService.show();
    try {
      const { user } = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      if (user) {
        const userType = await this.getUserType(user.uid);
        if (!userType) throw new Error('El usuario no tiene un tipo definido');

        if (userType === 'especialistas') {
          const especialistaData = await this.getEspecialista(user.uid);
          if (especialistaData && especialistaData.habilitado === true) {
            this.successMessage = 'Inicio de sesión exitoso';
            this.errorMessage = '';
            this.router.navigate(['/home']);
          } else {
            await this.afAuth.signOut();
            throw new Error('La cuenta de especialista ha sido deshabilitada');
          }
        } else if (userType === 'administradores') {
          this.successMessage = 'Inicio de sesión exitoso';
          this.errorMessage = '';
          this.router.navigate(['/home']);
        } else {
          this.successMessage = 'Inicio de sesión exitoso';
          this.errorMessage = '';
          this.router.navigate(['/home']);
        }
      }
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error);
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.errorMessage,
      });
    } finally {
      this.loadingService.hide();
    }
  }

  setQuickAccess(userType: string) {
    switch (userType) {
      case 'admin':
        this.email = 'juan@juann.com';
        this.password = '123456';
        break;
      case 'especialista':
        this.email = 'rosario@rosario.com';
        this.password = '123456';
        break;
      case 'paciente':
        this.email = 'maria@maria.com';
        this.password = '123456';
        break;
      default:
        break;
    }
  }

  getErrorMessage(error: any): string {
    let customErrorMessage = '';
    switch (error.code) {
      case 'auth/user-not-found': customErrorMessage = 'No hay ningún usuario con ese correo'; break;
      case 'auth/invalid-email': customErrorMessage = 'El formato del correo electrónico es inválido'; break;
      case 'auth/wrong-password': customErrorMessage = 'La contraseña es incorrecta'; break;
      case 'auth/user-disabled': customErrorMessage = 'La cuenta de usuario ha sido deshabilitada'; break;
      case 'auth/invalid-credential': customErrorMessage = 'La credencial suministrada es incorrecta, está malformada o ha caducado'; break;
      default: customErrorMessage = 'Error al iniciar sesión: ' + error.message; break;
    }
    return customErrorMessage;
  }

  async getUserType(userId: string): Promise<string | null> {
    try {
      const adminDoc = await this.firestore.collection('administradores').doc(userId).get().toPromise();
      if (adminDoc && adminDoc.exists) return 'administradores';

      const especialistaDoc = await this.firestore.collection('especialistas').doc(userId).get().toPromise();
      if (especialistaDoc && especialistaDoc.exists) return 'especialistas';

      const pacienteDoc = await this.firestore.collection('pacientes').doc(userId).get().toPromise();
      if (pacienteDoc && pacienteDoc.exists) return 'pacientes';

      return null;
    } catch (error) {
      console.error('Error al determinar el tipo de usuario:', error);
      return null;
    }
  }

  async getEspecialista(userId: string): Promise<any | null> {
    try {
      const especialistaDoc = await this.firestore.collection('especialistas').doc(userId).get().toPromise();
      return especialistaDoc?.data() || null;
    } catch (error) {
      console.error('Error al obtener datos del especialista:', error);
      return null;
    }
  }
}
