export class HistoriaClinica {
  altura: number;
  peso: number;
  temperatura: number;
  presion: string;
  Paciente: string;
  Especialista: string;
  horaTurno!: number;
  TurnoId: string;
  fechaTurno:number;
  datosDinamicos: { [clave: string]: string };

  constructor() {
    this.altura = 0;
    this.peso = 0;
    this.temperatura = 0;
    this.presion = '';
    this.fechaTurno= 0;
    this.TurnoId="";
    this.fechaTurno=0;
    this.Paciente = '';
    this.Especialista = '';
    this.datosDinamicos = {};
  }
}
