import { Turno } from "./turno";

export interface PacienteConTurnos {
    uid: string;
    nombre: string;
    apellido: string;
    edad: number;
    imageUrl1?: string;
    historiaClinica?: {
      altura: number;
      peso: number;
      presion: string;
      temperatura: number;
    };
    turnos?: Turno[]; // Agregar la propiedad turnos como un array de Turno
  }
  