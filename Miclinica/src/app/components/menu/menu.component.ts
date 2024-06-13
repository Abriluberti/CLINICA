import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  isPaciente: boolean = false;
  isAdministrador: boolean = false;

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {}

  ngOnInit(): void {
    // Inicializar isPaciente e isAdministrador en false al cargar el componente
    this.isPaciente = false;
    this.isAdministrador = false;

    // Suscribirse al cambio de estado de autenticación
    this.afAuth.authState.subscribe(user => {
      if (user) {
        // Verificar si el usuario es un paciente
        this.firestore.collection('pacientes').doc(user.uid).get().subscribe(pacienteDoc => {
          this.isPaciente = pacienteDoc.exists;
        });

        // Verificar si el usuario es un administrador
        this.firestore.collection('administradores').doc(user.uid).get().subscribe(adminDoc => {
          this.isAdministrador = adminDoc.exists;
        });
      } else {
        // Si el usuario cierra sesión, restablecer isPaciente e isAdministrador a false
        this.isPaciente = false;
        this.isAdministrador = false;
      }
    });
  }
}