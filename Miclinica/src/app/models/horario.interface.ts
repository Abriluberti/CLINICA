// Asegúrate de que la estructura de HorarioTurno coincida con los datos esperados
interface HorarioTurno {
    especialidades: string;
    especialista: string;
    turno: {
      manana: boolean;
      tarde: boolean;
      noche: boolean;
    };
  }
  