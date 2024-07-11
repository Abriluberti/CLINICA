import { Component } from '@angular/core';
import { UsuariosComponent } from "../usuarios/usuarios.component";
import { GestionComponent } from "../gestion/gestion.component";
import { EspecialistasComponent } from "../especialistas/especialistas.component";
import { RegistroComponent } from "../registro/registro.component";
import { RegistroEspecialistaComponent } from "../registro-especialista/registro-especialista.component";
import { FondoRegistroComponent } from "../fondo-registro/fondo-registro.component";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';

@Component({
    selector: 'app-vistausuarios',
    standalone: true,
    templateUrl: './vistausuarios.component.html',
    styleUrl: './vistausuarios.component.css',
    imports: [UsuariosComponent, GestionComponent, EspecialistasComponent, RegistroComponent, RegistroEspecialistaComponent, FondoRegistroComponent],
    animations: [
      trigger('fadeInOut', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('0.5s ease-in-out', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          animate('0.3s ease-in-out', style({ opacity: 0 }))
        ])
      ])
    ]
  })
export class VistausuariosComponent {

    showFondoRegistro = false;
    constructor(private afAuth: AngularFireAuth, private router: Router) {}
   
    
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
