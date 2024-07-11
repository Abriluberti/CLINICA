import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router, RouterLink } from '@angular/router';
import { RegistroComponent } from '../registro/registro.component';
import { MatDialog } from '@angular/material/dialog';
import { FondoRegistroComponent } from '../fondo-registro/fondo-registro.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgIf } from '@angular/common';
import { UppercasePipe } from "../../pipe/uppercase.pipe";


@Component({
    selector: 'app-bienvenida',
    standalone: true,
    templateUrl: './bienvenida.component.html',
    animations: [
        trigger('slideInOut', [
            state('void', style({ opacity: 0, transform: 'scale(0.5)' })),
            transition(':enter, :leave', [
                animate('0.5s ease-in-out')
            ])
        ])
    ],
    styleUrl: './bienvenida.component.css',
    imports: [RouterLink, FondoRegistroComponent, NgIf, UppercasePipe]
})
export class BienvenidaComponent {
  showFondoRegistro = false;
  constructor(private afAuth: AngularFireAuth, private router: Router, private dialog: MatDialog) {}
 
  

  async navigateToLogin() {
    try {
      await this.afAuth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      this.router.navigate(['/login']);
    }
  }

  navigateToRegistro() {
    this.showFondoRegistro = true;
  }

  closeFondoRegistro() {
    this.showFondoRegistro = false;
  }

  handleEspecialista() {
    this.router.navigate(['/regespecialista']);
    this.closeFondoRegistro();
  }

  handlePaciente() {
    this.router.navigate(['/register']);
    this.closeFondoRegistro();
  }
}