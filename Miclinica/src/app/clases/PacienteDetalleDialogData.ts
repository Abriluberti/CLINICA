// paciente-detalle-dialog-data.ts
export interface PacienteDetalleDialogData {
    paciente: {
      nombre: string;
    };
    turnos: {
      fechaTurno: string;
      especialistaNombre: string;
      especialidades: string[];
      historiaClinica: {
        altura: number;
        peso: number;
        presion: string;
        temperatura: number;
        datosDinamicos: { clave: string; valor: string }[];
      };
    }[];
  }
  