import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { FirebaseService } from '../../servicios/firebase.service';
import { LoadingService } from '../../servicios/loading.service';
import { AuthService } from '../../servicios/auth.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Especialista } from '../../clases/especialista';
import { Turno } from '../../clases/turno';
import { HorarioTurno } from '../../clases/horario-turno.interface';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AngularFirestore, AngularFirestoreCollection, DocumentData, QuerySnapshot } from '@angular/fire/compat/firestore';
import { HistoriaClinica } from '../../clases/historia-clinica';
import { Observable, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-miperfil',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgForOf, NgIf],
  templateUrl: './miperfil.component.html',
  styleUrls: ['./miperfil.component.css']
})
export class MiperfilComponent implements OnInit {
  coleccion: string | null = null;
  especialistas: string[] = []; // Array para almacenar nombres únicos de especialistas
  @ViewChild('htmlData', { static: false }) htmlData!: ElementRef;
  turnos$: Observable<Turno[]> | undefined;
  pacienteId: string = ''; // Debes obtener este ID de la sesión del usuario o de algún otro lugar
  especialistaNombreSeleccionado: string = ''; // Nombre del especialista seleccionado para descargar historias clínicas
  usuario: any = null;
  especialistaSeleccionado: string = ''; // Nombre del especialista seleccionado para descargar historias clínicas
  historiaClinica: any = {}; 
  horario: { [key: string]: { manana: boolean, tarde: boolean, noche: boolean } } = {};
  especialidades: string[] = [];
  historiasClinicas: Turno[] = [];
  filtrar: boolean = false;
  especialistasT: any;
  @ViewChild('historiaClinica', { static: false }) historiaClinicaRef!: ElementRef;
  historiasClinicasCollection: AngularFirestoreCollection<Turno>;
  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private firestore: AngularFirestore
  ) {  this.historiasClinicasCollection = this.firestore.collection<Turno>('historiasClinicas'); }

  ngOnInit() {
    this.loadUser();
    this.authService.getUser().subscribe(user => {
      if (user) {
        this.pacienteId = user.uid; // Suponiendo que user.uid contiene el ID del paciente
        this.loadHistoriasClinicas();
      }
    });
  }

  async loadUser() {
    try {
      // Limpiar localStorage (esto podría no ser necesario si se deben mantener las sesiones anteriores)
      localStorage.removeItem('user');
      localStorage.removeItem('especialistas');
      localStorage.removeItem('administradores');
      localStorage.removeItem('pacientes');
      // Obtener información del usuario desde AuthService
      const userInfo: any = await this.authService.getInfoUsuario();
      this.usuario = userInfo;
  
      // Asignar valor a this.coleccion y guardar en localStorage según el tipo de usuario
      if (this.usuario.tipo === 'especialistas') {
        this.coleccion = 'especialistas'; // Corregido para especialistas
        localStorage.setItem('especialistas', JSON.stringify(userInfo)); // Usar 'especialista' en lugar de 'especialistas'
      } else if (this.usuario.tipo === 'administradores') {
        this.coleccion = 'administradores'; // Corregido para administradores
        localStorage.setItem('administradores', JSON.stringify(userInfo));
      } else {
        this.coleccion = 'pacientes';
        localStorage.setItem('pacientes', JSON.stringify(userInfo));
      }
  
      // Convertir especialidad única a un array para manejar de manera uniforme
      if (typeof this.usuario.especialidad === 'string') {
        this.especialidades = [this.usuario.especialidad];
      } else {
        this.especialidades = this.usuario.especialidades || [];
      }
  
      // Inicializar horarios cargados
      this.horario = this.usuario.turnos?.reduce((acc: any, turno: any) => {
        acc[turno.especialidades] = turno.turno;
        return acc;
      }, {}) || {};
  
      // Verificar y ajustar horarios
      this.inicializarHorarios();
  
      // Log para verificar que usuario.uid está definido y horarios cargados
      console.log('Usuario cargado:', this.usuario);
      console.log('Horarios cargados:', this.horario);
      console.log('Tipo de usuario:', this.usuario.tipo);
      console.log('Coleccion:', this.coleccion); // Asegúrate de ver el valor correcto aquí
  
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  }


  async loadHistoriaClinica() {
    try {
      if (!this.usuario || !this.usuario.uid) {
        console.error('Usuario no está definido correctamente');
        return;
      }

      // Cargar la primera historia clínica encontrada para el usuario actual
      this.firestore.collection<HistoriaClinica>('historiasClinicas', ref =>
        ref.where('Paciente', '==', this.usuario.uid)
      ).valueChanges().subscribe(
        historiasClinicas => {
          if (historiasClinicas.length > 0) {
            this.historiaClinica = historiasClinicas[0]; // Asignar la primera historia clínica encontrada
            console.log('Historia clínica cargada:', this.historiaClinica);
          } else {
            console.error('No se encontró ninguna historia clínica para el usuario actual');
          }
        },
        error => {
          console.error('Error al cargar la historia clínica:', error);
        }
      );
    } catch (error) {
      console.error('Error al cargar la historia clínica:', error);
    }
  }

  

  generarPDF() {
    // Generar PDF con las historias clínicas
    const doc = new jsPDF();
    let yOffset = 10;

    this.historiasClinicas.forEach((historia, index) => {
      doc.setFontSize(16);
      doc.text('Historia Clínica', 10, yOffset);
      doc.setFontSize(12);
      doc.text(`Paciente: ${historia.pacienteNombre}`, 10, yOffset + 10);
      doc.text(`Fecha: ${historia.fecha}`, 10, yOffset + 20);
      doc.text(`Altura: ${this.historiaClinica.altura}`, 10, yOffset + 60);
      doc.text(`Peso: ${this.historiaClinica.peso}`, 10, yOffset + 70);
      doc.text(`Presión: ${this.historiaClinica.presion}`, 10, yOffset + 80);
      doc.text(`Temperatura: ${this.historiaClinica.temperatura}`, 10, yOffset + 90);
      yOffset += 70; // Aumentar el offset para el próximo registro
      if (index < this.historiasClinicas.length - 1) {
        doc.addPage(); // Agregar nueva página para cada historia clínica
        yOffset = 10; // Reiniciar el offset en la nueva página
      }
    });

    doc.save('historias_clinicas.pdf');
  }

  loadHistoriasClinicas() {
    // Consultar historias clínicas filtradas por pacienteId
    this.firestore.collection<Turno>('turnos', ref => ref.where('pacienteId', '==', this.pacienteId))
      .valueChanges()
      .subscribe(
        historias => {
          this.historiasClinicas = historias;

          // Obtener nombres únicos de especialistas
          this.especialistas = this.obtenerNombresUnicosEspecialistas();
          console.log('Historias clínicas cargadas:', this.historiasClinicas);
          console.log('Especialistas disponibles:', this.especialistas);
        },
        error => {
          console.error('Error al cargar las historias clínicas:', error);
        }
      );
  }

  obtenerNombresUnicosEspecialistas(): string[] {
    // Obtener nombres únicos de especialistas
    const nombresUnicos = [...new Set(this.historiasClinicas.map(turno => turno.especialistaNombre))];
    return nombresUnicos;
  }
  async descargarHistoriasClinicas() {
    if (!this.especialistaSeleccionado) {
      console.error('Debe seleccionar un especialista para descargar las historias clínicas');
      return;
    }
  
    // Filtrar historias clínicas por especialistaSeleccionado
    const historiasFiltradas = this.historiasClinicas.filter(turno => turno.especialistaNombre === this.especialistaSeleccionado);
  
    if (historiasFiltradas.length === 0) {
      console.error('No hay historias clínicas para el especialista seleccionado');
      return;
    }
  
    if (historiasFiltradas.length === 0) {
      console.error('No hay historias clínicas para el especialista seleccionado');
      Swal.fire({
        icon: 'error',
        title: 'No tienes historia clínica con este especialista',
        text: 'No se encontraron historias clínicas registradas con el especialista seleccionado.'
      });
      return;
    }
    // Generar PDF con las historias clínicas filtradas
    const doc = new jsPDF();
    let yOffset = 20;
  
    // Logo de la clínica (opcional)
    const logo = new Image();
    logo.src = 'assets/image.png';
    doc.addImage(logo, 'PNG', 10, 10, 30, 30);
  
    doc.setFontSize(20);
    doc.text('Historias Clínicas', 70, 20);
    doc.setFontSize(14);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 70, 30);
  
    historiasFiltradas.forEach((turno, index) => {
      if (!turno.historiaClinica) {
        console.warn(`La historia clínica del turno ${turno.turnoId} está indefinida.`);
        return; // Salir del forEach si no hay historia clínica definida
      }
  
      const { historiaClinica } = turno;
      const { altura, peso, presion, temperatura, datosDinamicos } = historiaClinica;
  
      if (index > 0) {
        doc.addPage();
        yOffset = 20; // Resetear la posición vertical para la nueva página
      }
  
      doc.setFontSize(14);
      doc.text(`Especialista: ${turno.especialistaNombre}`, 10, yOffset + 30);
      doc.text(`Paciente: ${turno.pacienteNombre}`, 10, yOffset + 40);
  
      if (Array.isArray(turno.especialidades) && turno.especialidades.length > 1) {
        doc.text(`Especialidad: ${turno.especialidades[1]}`, 10, yOffset + 50);
      } else {
        console.warn(`El turno ${turno.turnoId} no tiene la especialidad correcta definida.`);
        // Manejar el caso donde no hay especialidad disponible
        if (turno.especialidadId) {
          // Aquí puedes añadir lógica para buscar el nombre de la especialidad usando el especialidadId
          doc.text(`Especialidad: ${turno.especialidadId}`, 10, yOffset + 50);
        } else {
          doc.text(`Especialidad: No disponible`, 10, yOffset + 50);
        }
      }
  
      doc.setFontSize(12);
      doc.text(`Altura: ${altura}`, 10, yOffset + 60);
      doc.text(`Peso: ${peso}`, 10, yOffset + 70);
      doc.text(`Presión: ${presion}`, 10, yOffset + 80);
      doc.text(`Temperatura: ${temperatura}`, 10, yOffset + 90);
  
      // Verificar si datosDinamicos es un array antes de intentar iterar sobre él
      if (Array.isArray(datosDinamicos) && datosDinamicos.length > 0) {
        datosDinamicos.forEach((datoDinamico: { clave: string; valor: string; }, idx: number) => {
          doc.text(`${datoDinamico.clave}: ${datoDinamico.valor}`, 10, yOffset + 100 + (idx * 10));
        });
      } else {
        console.warn('No hay datos dinámicos para mostrar.');
      }
  
      yOffset += 110; // Ajustar el yOffset para la siguiente sección
    });
  
    doc.save(`Historias_Clinicas_${this.especialistaSeleccionado}.pdf`);
  }
  

inicializarHorarios() {
  // Verificar si 'especialidades' es un array o un string y convertirlo a un array si es necesario
  const especialidadesArray = Array.isArray(this.especialidades) ? this.especialidades : [this.especialidades];

  especialidadesArray.forEach((especialidad: string) => {
    if (!this.horario[especialidad]) {
      this.horario[especialidad] = {
        manana: false,
        tarde: false,
        noche: false
      };
    }
  });
}




async filtrarEspecialistas(especialistaUid: string) {
  try {
    const filtro = this.historiasClinicas.filter(
      (historia: Turno) => historia.especialistaId === especialistaUid
    );
    this.historiasClinicas = filtro;
    console.log(filtro);
  } catch (error) {
    console.error('Error al filtrar especialistas:', error);
  }
}


  guardar() {
    try {
      if (!this.usuario || !this.usuario.uid) {
        throw new Error('Usuario no está definido correctamente');
      }
  
      this.usuario.turnos = [];
      this.especialidades.forEach((especialidad: string) => {
        const turno = this.horario[especialidad];
        if (turno) {
          const nuevoHorario: HorarioTurno = {
            especialidades: especialidad,
            especialista: this.usuario.uid,
            turno: {
              manana: turno.manana || false,
              tarde: turno.tarde || false,
              noche: turno.noche || false
            }
          };
          this.usuario.turnos.push(nuevoHorario);
        }
      });
  
      // Log para verificar los datos generados
      console.log('Turnos generados:', this.usuario.turnos);
  
      const turnosValidos = this.usuario.turnos.every((turno: HorarioTurno) => {
        const valid = turno.especialidades && turno.especialista && turno.turno &&
          (turno.turno.manana !== undefined) &&
          (turno.turno.tarde !== undefined) &&
          (turno.turno.noche !== undefined);
        if (!valid) {
          console.error('Datos inválidos en turno:', turno);
        }
        return valid;
      });
  
      if (turnosValidos) {
        this.authService.actualizarHorariosEspecialista(this.usuario.uid, this.usuario.turnos)
          .then(() => {
            Swal.fire('Guardado', 'Los horarios han sido guardados exitosamente', 'success');
          })
          .catch(error => {
            console.error('Error al guardar horarios:', error);
            Swal.fire('Error', 'Hubo un error al guardar los horarios', 'error');
          });
      } else {
        throw new Error('Datos inválidos detectados');
      }
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      Swal.fire('Error', 'Hubo un error al guardar los horarios', 'error');
    }
  }
  
  
  
  actualizarHorario(event: Event, especialidad: string, periodo: 'manana' | 'tarde' | 'noche') {
    try {
      const target = event.target as HTMLInputElement;
      if (!this.horario[especialidad]) {
        this.horario[especialidad] = {
          manana: false,
          tarde: false,
          noche: false
        };
      }
      this.horario[especialidad][periodo] = target.checked;
    } catch (error) {
      console.error('Error al actualizar horario:', error);
    }
  }
  

  verhistoriasFiltrada() {
    this.filtrar = !this.filtrar;
  }

  convertImageToBase64(imagen: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get(imagen, { responseType: 'blob' }).subscribe((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
        reader.onerror = () => {
          reject('Error al leer la imagen');
        };
        reader.readAsDataURL(blob);
      }, (error) => {
        console.error('Error al obtener la imagen en formato blob:', error);
        reject(error);
      });
    });
  }
  
  
}