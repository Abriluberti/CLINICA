import { Horario } from './horario'; // Ajustar la ruta según tu estructura de archivos

export class Especialista {
  uid: string;
  nombre: string;
  apellido: string;
  edad: number;
  dni: number;
  especialidades: string[];
  especialidad: string[];
  imageUrl1: string; // URL de la imagen del especialista
  verificado: string;
  turnos: Horario[];

  constructor(
    uid: string,
    nombre: string,
    apellido: string,
    edad: number,
    dni: number,
    especialidades: string[],
    especialidad: string[],
    imageUrl1: string,
    verificado: string,
    turnos: Horario[] = []
  ) {
    this.uid = uid;
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
    this.dni = dni;
    this.especialidades = especialidades;
    this.especialidad = especialidad;
    this.imageUrl1 = imageUrl1;
    this.verificado = verificado;
    this.turnos = turnos;
  }
}
