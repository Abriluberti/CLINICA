import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FirebaseService } from '../../servicios/firebase.service';
import { NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-grafico-turnos-finalizados',
  standalone: true,
  imports: [NgFor,ReactiveFormsModule, FormsModule],
  templateUrl: './grafico-turnos-finalizados.component.html',
  styleUrl: './grafico-turnos-finalizados.component.css'
})
export class GraficoTurnosFinalizadosComponent {
  @ViewChild('chart') chartElement!: ElementRef;
  private chart: Chart | undefined;
  fechasSeleccionadas: { inicio: Date, fin: Date } = { inicio: new Date(), fin: new Date() };
  turnosFinalizadosPorEspecialista: { especialista: string, cantidad: number }[] = [];

  constructor(private firebaseService: FirebaseService) {
    Chart.register(...registerables); // Registrando los módulos de Chart.js necesarios
  }

  ngAfterViewInit(): void {
    // Inicialmente renderizamos el gráfico con datos por defecto
    this.renderChart();
  }

  renderChart(): void {
    const ctx = this.chartElement.nativeElement.getContext('2d');

    // Llamar a FirebaseService para obtener datos según el rango de fechas y el estado de búsqueda de realizados
    this.firebaseService.getTurnosFinalizadosPorEspecialistaEnRango(
      this.fechasSeleccionadas.inicio,
      this.fechasSeleccionadas.fin
    ).subscribe((data: any[]) => {
      this.turnosFinalizadosPorEspecialista = this.procesarDatos(data);
      this.renderizarGrafico(ctx);
    });
  }

  procesarDatos(data: any[]): { especialista: string, cantidad: number }[] {
    // Agrupar los turnos finalizados por especialista y sumar la cantidad de turnos
    const turnosPorEspecialista = data.reduce((acc, turno) => {
      const especialista = turno.especialistaNombre; // Asumiendo que tienes el nombre del especialista en el campo especialistaNombre
      if (acc[especialista]) {
        acc[especialista].cantidad++;
      } else {
        acc[especialista] = { especialista, cantidad: 1 };
      }
      return acc;
    }, {} as { [key: string]: { especialista: string, cantidad: number } });

    return Object.values(turnosPorEspecialista);
  }

  renderizarGrafico(ctx: CanvasRenderingContext2D): void {
    if (this.chart) {
      this.chart.destroy(); // Destruye el gráfico anterior si existe
    }

    const especialistas = this.turnosFinalizadosPorEspecialista.map(turno => turno.especialista);
    const cantidades = this.turnosFinalizadosPorEspecialista.map(turno => turno.cantidad);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: especialistas,
        datasets: [{
          label: 'Cantidad de Turnos Realizados',
          data: cantidades,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  downloadPDF(): void {
    const chartElement = this.chartElement.nativeElement;

    html2canvas(chartElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('grafico_turnos_realizados.pdf');
    });
  }

  onFechasSeleccionadasChange(): void {
    // Llamar a renderChart() para actualizar el gráfico cuando cambian las fechas
    this.renderChart();
  }
}