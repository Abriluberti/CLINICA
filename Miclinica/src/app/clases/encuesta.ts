export class Encuesta {
  uid: string;
  puntajeClinica: number;
  comentarioClinica: string;
  puntajeEspecialista: number;
  comentarioEspecialista: string;
  constructor(
    puntajeClinica: number,
    comentarioClinica: string,
    puntajeEspecialista: number,
    comentarioEspecialista: string
  ) {
    this.puntajeClinica = puntajeClinica;
    this.comentarioClinica = comentarioClinica;
    this.puntajeEspecialista = puntajeEspecialista;
    this.comentarioEspecialista = comentarioEspecialista;
    this.uid = '';
  }
}
