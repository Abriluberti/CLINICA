interface HorarioTurno {
  especialidades: string;
  especialista: string;
  turno: {
    manana: boolean;
    tarde: boolean;
    noche: boolean;
  };
}
