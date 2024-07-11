
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { PacienteDetalleDialogComponent } from '../paciente-detalle-dialog/paciente-detalle-dialog.component';
import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { take } from 'rxjs';
import { Paciente } from '../../clases/paciente';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css'],
  imports: [NgFor, NgIf, SlicePipe, PacientesComponent, PacienteDetalleDialogComponent]
})
export class PacientesComponent {
  @Output() seleccionarPaciente = new EventEmitter<any>();
  pacientesAtendidos: any[] = [];

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        const especialistaId = user.uid;
        this.obtenerPacientesAtendidos(especialistaId);
      }
    });
  }

  obtenerPacientesAtendidos(especialistaId: string): void {
    this.firestore
      .collection('turnos', ref =>
        ref.where('especialistaId', '==', especialistaId).where('historiaClinica', '!=', null)
      )
      .valueChanges({ idField: 'id' })
      .subscribe(
        (turnos: any[]) => {
          this.cargarPacientes(turnos);
        },
        (error: any) => {
          console.error('Error al obtener pacientes atendidos:', error);
        }
      );
  }

  async cargarPacientes(turnos: any[]): Promise<void> {
    const pacientesMap = new Map<string, any>(); // Usamos un mapa para agrupar por pacienteId
  
    for (const turno of turnos) {
      const pacienteId = turno.pacienteId;
  
      if (!pacientesMap.has(pacienteId)) {
        try {
          const paciente = await this.firestore
            .doc(`pacientes/${pacienteId}`)
            .valueChanges()
            .pipe(take(1))
            .toPromise() as any;
  
          pacientesMap.set(pacienteId, {
            id: pacienteId,
            nombre: paciente.nombre,
            imageUrl1: paciente.imageUrl1 || 'assets/default-avatar.png',
            especialistaId: turno.especialistaId,
            especialidadId: turno.especialidadId,
            turnos: []
          });
        } catch (error) {
          console.error('Error al obtener datos del paciente:', error);
        }
      }
  
      const pacienteData = pacientesMap.get(pacienteId);
      pacienteData.turnos.push({
        fechaTurno: turno.fecha,
        horaTurno: turno.hora,
        historiaClinica: turno.historiaClinica,
        resena: turno.resena,
        especialidadId :turno.especialidadId
      });
    }
  
    this.pacientesAtendidos = Array.from(pacientesMap.values());
  }
  
  seleccionarPacienteClick(paciente: any): void {
    console.log('Paciente seleccionado:', paciente);
    this.seleccionarPaciente.emit(paciente);
  }
}