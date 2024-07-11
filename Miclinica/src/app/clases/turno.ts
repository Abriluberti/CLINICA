import { HistoriaClinica } from "./historia-clinica";

export class Turno {
  uid: string;
  idEspecialista: string;
  especialidades: string[];
  idEspecialidad: string;
  especialistaId: string;
  especialidadId:string;
  pacienteId: string;
  especialistaNombre: string;
  estado: string;
  fecha: string;
  hora: string;
  id: string;
  resena?: string;
  encuesta?: boolean;
  fotoPaciente?: any;
  comentario?: string;
  atencion?: any;
  calificacion?: boolean;
  pacienteNombre: string;
  encuestaCompleta: any;
  motivo?: string; // Propiedad opcional para el motivo
  nombreEspecialista: string;
  historiaClinica: HistoriaClinica;
  turnoId: string;

  constructor(
    uid: string,
    idEspecialista: string,
    especialidades: string[],
    idEspecialidad: string,
    especialistaId: string,
    pacienteId: string,
    especialistaNombre: string,
    estado: string,
    fecha: string,
    turnoId: string,
    especialidadId:string,
    hora: string,
    pacienteNombre: string,
    id: string,
    historiaClinica: HistoriaClinica,
    encuestaCompleta: any,
    nombreEspecialista: string,
    comentario?: string,
    atencion?: any,
    resena?: string,
    encuesta?: boolean,
    fotoPaciente?: any,
    calificacion?: boolean,
  ) {
    this.uid = uid;
    this.idEspecialista = idEspecialista;
    this.especialidades = especialidades;
    this.idEspecialidad = idEspecialidad;
    this.especialistaId = especialistaId;
    this.pacienteId = pacienteId;
    this.especialistaNombre = especialistaNombre;
    this.estado = estado;
    this.fecha = fecha;
    this.hora = hora;
    this.atencion= atencion;
    this.fotoPaciente=fotoPaciente;
    this.comentario= comentario;
    this.pacienteNombre = pacienteNombre;
    this.id = id;
    this.especialidadId=especialidadId;
    this.turnoId=turnoId;
    this.historiaClinica = historiaClinica;
    this.encuestaCompleta = encuestaCompleta;
    this.nombreEspecialista = nombreEspecialista;
    this.resena = resena;
    this.encuesta = encuesta;
    this.calificacion = calificacion;
  }
}
