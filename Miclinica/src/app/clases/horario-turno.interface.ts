// archivo: src/app/clases/horario-turno.interface.ts

export interface HorarioTurno {
    especialidades: string;
    especialista: string;
    turno: {
      manana: boolean;
      tarde: boolean;
      noche: boolean;
    };
  }
  