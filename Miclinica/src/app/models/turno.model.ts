export class Turno {
    id: string;
    especialidadId: string;
    especialistaId: string;
    pacienteId: string; // Nueva propiedad agregada
    paciente: string; // Nueva propiedad agregada
    fecha: string;
    hora: string;
    estado: string;
    comentarioCancelacion?: string;
    resena?: string;
    encuestaCompleta?: boolean;
  
    constructor(
      id: string,
      especialidadId: string,
      especialistaId: string,
      pacienteId: string, // Agregar al constructor
      paciente: string, // Agregar al constructor
      fecha: string,
      hora: string,
      estado: string,
      comentarioCancelacion?: string,
      resena?: string,
      encuestaCompleta?: boolean
    ) {
      this.id = id;
      this.especialidadId = especialidadId;
      this.especialistaId = especialistaId;
      this.pacienteId = pacienteId; // Asignar al constructor
      this.paciente = paciente; // Asignar al constructor
      this.fecha = fecha;
      this.hora = hora;
      this.estado = estado;
      this.comentarioCancelacion = comentarioCancelacion;
      this.resena = resena;
      this.encuestaCompleta = encuestaCompleta;
    }
  }
  