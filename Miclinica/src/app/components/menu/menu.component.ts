import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { HoverTraceDirective } from '../../directives/hover-trace.directive';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'] // Fixed typo here
})
export class MenuComponent implements OnInit {
  isPaciente: boolean = false;
  isAdministrador: boolean = false;
  isEspecialista: boolean = false; // Fixed naming consistency

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {}

  ngOnInit(): void {
    // Initialize isPaciente, isAdministrador, and isEspecialista to false on component load
    this.isPaciente = false;
    this.isAdministrador = false;
    this.isEspecialista = false; // Ensure consistency

    // Subscribe to authentication state changes
    this.afAuth.authState.subscribe(user => {
      if (user) {
        // Check if the user is a patient
        this.firestore.collection('pacientes').doc(user.uid).get().subscribe(pacienteDoc => {
          this.isPaciente = pacienteDoc.exists;
        });

        // Check if the user is an administrator
        this.firestore.collection('administradores').doc(user.uid).get().subscribe(adminDoc => {
          this.isAdministrador = adminDoc.exists;
        });

        // Check if the user is an specialist
        this.firestore.collection('especialistas').doc(user.uid).get().subscribe(especialistaDoc => {
          this.isEspecialista = especialistaDoc.exists; // Ensure this is correctly assigned
        });
      } else {
        // If the user logs out, reset isPaciente, isAdministrador, and isEspecialista to false
        this.isPaciente = false;
        this.isAdministrador = false;
        this.isEspecialista = false; // Ensure consistency
      }
    });
  }
}
