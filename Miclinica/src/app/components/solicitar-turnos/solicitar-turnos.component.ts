import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-solicitar-turnos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './solicitar-turnos.component.html',
  styleUrls: ['./solicitar-turnos.component.css']
})
export class SolicitarTurnosComponent implements OnInit {
  pacientes$: Observable<any[]> | null = null;
  especialidades$: Observable<string[]> | null = null;
  especialistas$: Observable<any[]> = of([]);
  pacienteNombre: string | null = null;
  pacienteSeleccionado: string = '';
  especialidadSeleccionada: string = '';
  especialistaSeleccionado: string = '';
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  isAdmin: boolean = false;

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.firestore.collection('pacientes').doc(user.uid).valueChanges().subscribe((data: any) => {
          if (data) {
            this.pacienteNombre = data.nombre;
          }
        });

        this.isAdmin = false; // Por defecto, el usuario no es un administrador

        // Obtener especialidades
        this.especialidades$ = this.firestore.collection('especialidades').valueChanges().pipe(
          map((especialidades: any[]) => especialidades.map(especialidad => especialidad.nombre))
        );

        // Obtener especialistas
        this.especialistas$ = this.firestore.collection('especialistas').valueChanges();
      } else {
        this.pacienteNombre = null;
        this.isAdmin = false;
      }
    });
  }
  solicitarTurno() {
    if (!this.especialidadSeleccionada || !this.especialistaSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) {
      console.error('Todos los campos son requeridos.');
      return;
    }
  
    if (!this.especialistas$) {
      console.error('No se encontraron especialistas.');
      return;
    }
  
    this.afAuth.authState.subscribe(user => {
      if (user) {
        const pacienteId = user.uid; // Obtenemos el UID del paciente actual
  
        const especialistaSeleccionadoNombre$ = this.especialistas$.pipe(
          map(especialistas => {
            const especialista = especialistas.find(especialista => especialista.nombre === this.especialistaSeleccionado);
            console.log('Especialista seleccionado:', especialista);
            return especialista ? especialista.nombre : null;
          })
        );
  
        especialistaSeleccionadoNombre$.subscribe(especialistaSeleccionadoNombre => {
          if (especialistaSeleccionadoNombre) {
            // Realizar la lógica para guardar el turno en la base de datos
            this.firestore.collection('turnos').add({
              pacienteId: pacienteId, // Asociamos el UID del paciente al turno
              especialidadId: this.especialidadSeleccionada,
              especialistaId: especialistaSeleccionadoNombre, // Utilizamos el nombre del especialista seleccionado
              fecha: this.fechaSeleccionada,
              hora: this.horaSeleccionada,
              estado: 'Pendiente'
            }).then(() => {
              console.log('Turno solicitado con éxito');
            }).catch(error => {
              console.error('Error al solicitar turno:', error);
            });
          } else {
            console.error('No se encontró el nombre del especialista seleccionado.');
          }
        });
      } else {
        console.error('Usuario no autenticado.');
      }
    });
  }
  
}
