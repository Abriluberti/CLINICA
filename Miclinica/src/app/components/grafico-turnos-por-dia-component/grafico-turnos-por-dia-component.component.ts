import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FirebaseService } from '../../servicios/firebase.service';
import { NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-grafico-turnos-por-dia-component',
  standalone: true,
  imports: [NgFor,ReactiveFormsModule, FormsModule],
  templateUrl: './grafico-turnos-por-dia-component.component.html',
  styleUrl: './grafico-turnos-por-dia-component.component.css'
})
export class GraficoTurnosPorDiaComponentComponent {
  turnos: any[] = [];
  meses: string[] = [];
  mesesSeleccionados: string[] = [];

  @ViewChild('chart') chart!: ElementRef;

  constructor(private firebaseService: FirebaseService) {
    Chart.register(...registerables); // Registrar los módulos de Chart.js necesarios
  }

  ngOnInit(): void {
    this.firebaseService.getTurnos().subscribe((data: any[]) => {
      this.turnos = data;
      this.extraerMeses();
    });
  }

  extraerMeses(): void {
    const fechas = this.turnos.map(turno => turno.fecha);
    const mesesSet = new Set(fechas.map(fecha => fecha.slice(0, 7))); // Utilizar un Set para evitar duplicados
    this.meses = Array.from(mesesSet).sort(); // Ordenar los meses
  }

  agregarMes(mes: string): void {
    if (!this.mesesSeleccionados.includes(mes)) {
      this.mesesSeleccionados.push(mes);
      this.renderChart();
    }
  }

  quitarMes(mes: string): void {
    this.mesesSeleccionados = this.mesesSeleccionados.filter(m => m !== mes);
    this.renderChart();
  }

  renderChart(): void {
    const ctx = this.chart.nativeElement.getContext('2d');
    if (ctx) {
      // Limpiar el gráfico anterior
      if (Chart['instances'] && Object.keys(Chart['instances']).length > 0) {
        Object.keys(Chart['instances']).forEach(key => {
          const instance = Chart['instances'][key];
          instance.destroy();
        });
      }
  
      // Preparar datos por cada mes seleccionado
      this.mesesSeleccionados.forEach(mes => {
        const turnosMes = this.turnos.filter(turno => turno.fecha.startsWith(mes));
        const dias: string[] = [];
        const counts: { [key: string]: number } = {};
  
        turnosMes.forEach(turno => {
          const dia = turno.fecha.slice(8, 10); // Tomar solo el día (formato DD)
          dias.push(dia);
          counts[dia] = (counts[dia] || 0) + 1;
        });
  
        const sortedDias = dias.sort((a, b) => Number(a) - Number(b)); // Ordenar los días numéricamente
        const data = sortedDias.map(dia => counts[dia]);
  
        // Crear un nuevo gráfico para cada mes seleccionado
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: sortedDias, // Usar los días ordenados como etiquetas
            datasets: [{
              label: `Cantidad de Turnos por Día en ${mes}`,
              data: data,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
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
      });
    }
  }
  

  downloadAsPDF(): void {
    const chartElement = this.chart.nativeElement;
    html2canvas(chartElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('grafico.pdf');
    });
  }
}