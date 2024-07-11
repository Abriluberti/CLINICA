import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';
import { FirebaseService } from '../../servicios/firebase.service';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule,  ],
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']  // Corregido a styleUrls
})
export class GestionComponent implements OnInit {
  pacientes: any[] = [];
  especialistas: any[] = [];
  administradores: any[] = [];

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.cargarPacientes();
    this.cargarEspecialistas();
    this.cargarAdministradores();
  }

  cargarPacientes() {
    this.firestore.collection('pacientes').snapshotChanges().subscribe(data => {
      this.pacientes = data.map(paciente => {
        const dataPaciente: any = paciente.payload.doc.data();
        const id = paciente.payload.doc.id; // Obtener el ID del documento
        return {
          ...dataPaciente,
          uid: id,
          perfil: 'paciente'
        };
      });
    });
  }
  
  cargarEspecialistas() {
    this.firestore.collection('especialistas').valueChanges({ idField: 'index' }).subscribe(data => {
      this.especialistas = data.map(especialista => ({ ...especialista, perfil: 'especialista' }));
    });
  }

  cargarAdministradores() {
    this.firestore.collection('administradores').valueChanges({ idField: 'index' }).subscribe(data => {
      this.administradores = data.map(administrador => ({ ...administrador, perfil: 'administrador' }));
    });
  }

  seleccionarPaciente(paciente: any) {
    const pacienteId = paciente.uid;
    if (!pacienteId) {
      console.error('El pacienteId es undefined o null.');
      return;
    }

    this.descargarHistoriasClinicas(pacienteId);
  }

  descargarHistoriasClinicas(pacienteId: string) {
    if (!pacienteId) {
      console.error('El pacienteId es undefined o null.');
      return;
    }
  
    this.firestore.collection('turnos', ref => ref.where('pacienteId', '==', pacienteId).where('historiaClinica', '!=', null))
      .get()
      .subscribe(snapshot => {
        if (snapshot.empty) {
          console.log('No hay historias clínicas disponibles para este paciente.');
          return;
        }
        
        const workbook = XLSX.utils.book_new();
        const sheetName = 'Historias_Clinicas';
        const worksheetData: any[] = [];
  
        snapshot.forEach(doc => {
          const turno: any = doc.data();
          const historiaClinica = turno.historiaClinica || {};
  
          if (!historiaClinica || Object.keys(historiaClinica).length === 0) {
            console.warn(`La historia clínica para el turno con ID ${doc.id} no está definida o está vacía.`);
            return;
          }
  
          let datosDinamicos = '';
          if (historiaClinica.datosDinamicos) {
            datosDinamicos = historiaClinica.datosDinamicos.map((item: any) => {
              return `${item.clave}: ${item.valor}`;
            }).join(', ');
          }
  
          const fechaTurno = turno.fecha ? new Date(turno.fecha) : null;
          const dia = fechaTurno ? fechaTurno.getDate() : '';
          const mes = fechaTurno ? fechaTurno.getMonth() + 1 : '';
          const año = fechaTurno ? fechaTurno.getFullYear() : '';
  
          // Utilizar solo la especialidad del turno
          const especialidad = turno.especialidades && turno.especialidades.length > 0 ? turno.especialidades[0] : '';
  
          const data = {
            Paciente: turno.pacienteNombre || '',
            Especialista: turno.especialistaNombre || '',
            Especialidad: especialidad || '',
            Dia: dia,
            Mes: mes,
            Año: año,
            Altura: historiaClinica.altura || '',
            DatosDinamicos: datosDinamicos,
            Peso: historiaClinica.peso || '',
            Presion: historiaClinica.presion || '',
            Temperatura: historiaClinica.temperatura || '',
            FechaTurno: fechaTurno ? fechaTurno.toLocaleDateString() : '',
            HoraTurno: turno.hora || '',
            Resena: turno.resena || '',
            TurnoId: turno.turnoId || ''
          };
  
          worksheetData.push(data);
        });
  
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        
        XLSX.writeFile(workbook, `Historias_Clinicas_.xlsx`);
      });
  }
}