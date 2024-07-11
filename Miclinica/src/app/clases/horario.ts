export class Horario {
  especialidad: string;
  turno: {
    manana: boolean;
    tarde: boolean;
    noche: boolean;
  };

  constructor(especialidad: string, turno: { manana: boolean; tarde: boolean; noche: boolean }) {
    this.especialidad = especialidad;
    this.turno = turno;
  }
}
