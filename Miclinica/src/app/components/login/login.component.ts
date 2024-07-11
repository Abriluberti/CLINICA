import { NgIf, AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';
import { FirebaseService } from '../../servicios/firebase.service';
import { LoadingService } from '../../servicios/loading.service';
import firebase from 'firebase/compat/app';
import { HoverBackgroundDirective } from '../../directives/hover-background.directive';
import { UppercasePipe } from "../../pipe/uppercase.pipe";
import { CapitalizePipe } from '../../pipe/capitalize.pipe';
import { RandomBackgroundDirective } from '../../directives/random-background.directive';
import { HoverTraceDirective } from '../../directives/hover-trace.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RouterOutlet,
    NgIf,
    AsyncPipe,
    RandomBackgroundDirective ,
    HoverTraceDirective,
    FormsModule,
    CapitalizePipe // Incluye el pipe aquí
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading$ = this.loadingService.loading$;
  especialistaUno: any; // Define la propiedad según corresponda

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

        if (userType !== 'administradores' && !user.emailVerified) {
          throw new Error('Debe verificar su correo electrónico antes de iniciar sesión');
        }
  

        if (userType === 'especialistas') {
          const especialistaData = await this.getEspecialista(user.uid);
          if (especialistaData && especialistaData.habilitado === true) {
            this.successMessage = 'Inicio de sesión exitoso';
            this.errorMessage = '';
            await this.logUserLogin(user);
            this.router.navigate(['/home']);
          } else {
            await this.afAuth.signOut();
            throw new Error('La cuenta de especialista ha sido deshabilitada');
          }
        } else {
          this.successMessage = 'Inicio de sesión exitoso';
          this.errorMessage = '';
          await this.logUserLogin(user);
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
    const userCredentials: { [key: string]: { email: string; password: string; } } = {
      'admin': { email: 'juan@juann.com', password: '123456' },
      'especialista': { email: 'lagase3662@apn7.com', password: '123456' },
      'especialista2': { email: 'fedok83915@bacaki.com', password: '123456' },
      'paciente1': { email: 'warinib748@bacaki.com', password: '123456' },
      'paciente2': { email: 'bajimo8650@bacaki.com', password: '123456' },
      'paciente3': { email: 'botoci4441@bsidesmn.com', password: '123456' }
    };

    this.email = userCredentials[userType]?.email || '';
    this.password = userCredentials[userType]?.password || '';
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
      if (adminDoc?.exists) return 'administradores';

      const especialistaDoc = await this.firestore.collection('especialistas').doc(userId).get().toPromise();
      if (especialistaDoc?.exists) return 'especialistas';

      const pacienteDoc = await this.firestore.collection('pacientes').doc(userId).get().toPromise();
      if (pacienteDoc?.exists) return 'pacientes';

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

  private async logUserLogin(user: firebase.User | null) {
    if (user) {
      await this.firestore.collection('logEntries').add({
        userId: user.uid,
        username: user.email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  }
}
